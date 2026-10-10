import io
import os
import re
import tempfile
import wave
from typing import List, Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pydantic import BaseModel

MODEL_NAME = os.environ.get("WHISPER_MODEL", "base.en")
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
PORT = int(os.environ.get("WHISPER_PORT", "8000"))

app = FastAPI(
    title="Sonorauris Faster-Whisper Assessment Engine",
    description="Tier-2 Local AI Speech Pronunciation Assessment (SRS Section 8.1 & 8.2)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: Optional[WhisperModel] = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        print(f"[WhisperServer] Loading faster-whisper model '{MODEL_NAME}' ({COMPUTE_TYPE})...")
        _model = WhisperModel(MODEL_NAME, device="cpu", compute_type=COMPUTE_TYPE)
        print(f"[WhisperServer] Model '{MODEL_NAME}' ready on port {PORT}.")
    return _model


class MiscueWord(BaseModel):
    word: str
    type: Optional[str] = None
    phoneticHint: Optional[str] = None
    confidence: Optional[int] = None
    startSec: Optional[float] = None
    endSec: Optional[float] = None


class AssessmentResponse(BaseModel):
    accuracy: int
    fluency: int
    completeness: int
    prosody: int
    battleScore: int
    words: List[MiscueWord]
    recognizedText: str
    spokenWpm: int = 0
    engine: str = "faster-whisper"


PHONETIC_MAP = {
    "through": "/θruː/",
    "thought": "/θɔːt/",
    "schedule": "/ˈskedʒ.uːl/",
    "comfortable": "/ˈkʌm.fə.tə.bəl/",
    "squirrel": "/ˈskwɪr.əl/",
    "world": "/wɜːrld/",
    "literally": "/ˈlɪt.ər.əl.i/",
    "focus": "/ˈfoʊ.kəs/",
    "rhythm": "/ˈrɪð.əm/",
    "shadowing": "/ˈʃæd.oʊ.ɪŋ/",
    "pronunciation": "/prəˌnʌn.siˈeɪ.ʃən/",
    "opportunity": "/ˌɑː.pɚˈtuː.nə.t̬i/",
    "technology": "/tekˈnɑː.lə.dʒi/",
    "communication": "/kəˌmjuː.nəˈkeɪ.ʃən/",
    "environment": "/ɪnˈvaɪ.rən.mənt/",
}


def to_phonetic_hint(word: str) -> str:
    lower = re.sub(r"[^a-z]", "", word.lower())
    if not lower:
        return "/.../"
    if lower in PHONETIC_MAP:
        return PHONETIC_MAP[lower]

    ipa = lower
    ipa = re.sub(r"tion$", "ʃən", ipa)
    ipa = re.sub(r"sion$", "ʒən", ipa)
    ipa = ipa.replace("th", "θ").replace("sh", "ʃ").replace("ch", "tʃ").replace("ph", "f")
    ipa = ipa.replace("igh", "aɪ").replace("oo", "uː")
    ipa = re.sub(r"ee|ea", "iː", ipa)
    ipa = re.sub(r"ou|ow", "aʊ", ipa)
    ipa = re.sub(r"er$", "ər", ipa)
    ipa = re.sub(r"ing$", "ɪŋ", ipa)
    return f"/ˈ{ipa}/"


def edit_distance(a: str, b: str) -> int:
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]


def extract_pcm_features(audio_bytes: bytes) -> dict:
    """Extracts RMS energy and Zero-Crossing Rate modulation from 16kHz WAV bytes."""
    try:
        with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            raw = wf.readframes(n_frames)
            samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    except Exception:
        return {"voiced_sec": 1.5, "prosody_score": 78}

    if len(samples) < 400:
        return {"voiced_sec": 0.0, "prosody_score": 0}

    frame_len = max(1, int(sample_rate * 0.05))  # 50ms window
    n_chunks = len(samples) // frame_len
    if n_chunks == 0:
        return {"voiced_sec": 0.0, "prosody_score": 0}

    trimmed = samples[: n_chunks * frame_len].reshape((n_chunks, frame_len))
    rms = np.sqrt(np.mean(trimmed**2, axis=1))
    voiced_mask = rms > 0.007
    voiced_rms = rms[voiced_mask]
    voiced_sec = float(np.sum(voiced_mask) * 0.05)

    if len(voiced_rms) < 3:
        return {"voiced_sec": voiced_sec, "prosody_score": 0}

    # Zero-crossing rate per voiced frame (proxy for pitch/intonation contour)
    signs = np.sign(trimmed[voiced_mask])
    zcr = np.mean(np.abs(np.diff(signs, axis=1)) > 0, axis=1)

    rms_cv = float(np.std(voiced_rms) / max(0.005, float(np.mean(voiced_rms))))
    zcr_cv = float(np.std(zcr) / max(0.01, float(np.mean(zcr))))

    # Natural English speech has moderate energy & pitch variation
    mod_index = min(1.2, (rms_cv * 0.6 + zcr_cv * 0.4))
    prosody_score = int(round(min(98, max(45, 68 + mod_index * 26))))
    return {"voiced_sec": voiced_sec, "prosody_score": prosody_score}


@app.on_event("startup")
async def startup_event():
    get_model()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "faster-whisper",
        "model": MODEL_NAME,
        "computeType": COMPUTE_TYPE,
    }


@app.post("/api/assess", response_model=AssessmentResponse)
async def assess_audio(
    audio: UploadFile = File(...),
    referenceText: str = Form(...),
):
    audio_bytes = await audio.read()
    clean_ref_tokens = [
        t for t in re.sub(r"[.,/#!$%^&*;:{}=\-_`~()?\"']", "", referenceText).split() if t
    ]

    if not clean_ref_tokens:
        return AssessmentResponse(
            accuracy=0,
            fluency=0,
            completeness=0,
            prosody=0,
            battleScore=0,
            words=[],
            recognizedText="",
            spokenWpm=0,
        )

    acoustic = extract_pcm_features(audio_bytes)

    suffix = ".wav" if (audio.content_type and "wav" in audio.content_type) else ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = get_model()
        # Pure acoustic transcription WITHOUT initial_prompt so mispronunciations are not auto-corrected
        segments, _ = model.transcribe(
            tmp_path,
            language="en",
            beam_size=5,
            word_timestamps=True,
            condition_on_previous_text=False,
            vad_filter=True,
        )

        spoken_words = []
        for seg in segments:
            if seg.words:
                for w in seg.words:
                    token_clean = re.sub(r"[.,/#!$%^&*;:{}=\-_`~()?\"']", "", w.word).strip()
                    if token_clean:
                        spoken_words.append(
                            {
                                "word": token_clean,
                                "lower": token_clean.lower(),
                                "start": float(w.start),
                                "end": float(w.end),
                                "prob": float(w.probability),
                            }
                        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    # Silence or empty speech check
    if not spoken_words or acoustic["voiced_sec"] < 0.25:
        return AssessmentResponse(
            accuracy=0,
            fluency=0,
            completeness=0,
            prosody=0,
            battleScore=0,
            words=[MiscueWord(word=w, type="omission") for w in clean_ref_tokens],
            recognizedText="",
            spokenWpm=0,
        )

    recognized_text = " ".join(w["word"] for w in spoken_words)

    # Needleman-Wunsch Dynamic Programming Sequence Alignment
    # Aligns clean_ref_tokens (length M) with spoken_words (length N) to detect:
    # - clean match
    # - mispronunciation (fuzzy phonetic edit distance or low acoustic probability)
    # - omission (reference word skipped)
    # - insertion (extra spoken word not in reference)
    m_len = len(clean_ref_tokens)
    n_len = len(spoken_words)
    gap_penalty = -2
    score_dp = [[0] * (n_len + 1) for _ in range(m_len + 1)]
    ptr_dp = [[""] * (n_len + 1) for _ in range(m_len + 1)]

    for i in range(1, m_len + 1):
        score_dp[i][0] = i * gap_penalty
        ptr_dp[i][0] = "UP"  # Omission
    for j in range(1, n_len + 1):
        score_dp[0][j] = j * gap_penalty
        ptr_dp[0][j] = "LEFT"  # Insertion

    for i in range(1, m_len + 1):
        ref_lower = clean_ref_tokens[i - 1].lower()
        max_dist = 2 if len(ref_lower) >= 5 else 1
        for j in range(1, n_len + 1):
            sw_lower = spoken_words[j - 1]["lower"]
            dist = edit_distance(ref_lower, sw_lower)
            if dist == 0:
                pair_score = 4
            elif dist <= max_dist:
                pair_score = 2
            else:
                pair_score = -3

            diag = score_dp[i - 1][j - 1] + pair_score
            up = score_dp[i - 1][j] + gap_penalty
            left = score_dp[i][j - 1] + gap_penalty

            if diag >= up and diag >= left:
                score_dp[i][j] = diag
                ptr_dp[i][j] = "DIAG"
            elif up >= left:
                score_dp[i][j] = up
                ptr_dp[i][j] = "UP"
            else:
                score_dp[i][j] = left
                ptr_dp[i][j] = "LEFT"

    # Backtrack alignment
    aligned_ops = []
    i_curr, j_curr = m_len, n_len
    while i_curr > 0 or j_curr > 0:
        move = ptr_dp[i_curr][j_curr]
        if move == "DIAG":
            aligned_ops.append(("DIAG", i_curr - 1, j_curr - 1))
            i_curr -= 1
            j_curr -= 1
        elif move == "UP":
            aligned_ops.append(("OMIT", i_curr - 1, -1))
            i_curr -= 1
        else:
            aligned_ops.append(("INSERT", -1, j_curr - 1))
            j_curr -= 1
    aligned_ops.reverse()

    miscue_words: List[MiscueWord] = []
    word_accuracy_scores: List[float] = []
    matched_count = 0
    insertion_count = 0

    for op, r_idx, s_idx in aligned_ops:
        if op == "DIAG":
            ref_word = clean_ref_tokens[r_idx]
            ref_lower = ref_word.lower()
            sw = spoken_words[s_idx]
            prob = sw["prob"]
            conf_pct = int(round(min(100.0, max(10.0, prob * 100.0))))
            dist = edit_distance(ref_lower, sw["lower"])
            max_allowed = 2 if len(ref_lower) >= 5 else 1

            if dist == 0:
                matched_count += 1
                if prob < 0.68 and len(ref_lower) >= 4:
                    miscue_words.append(
                        MiscueWord(
                            word=ref_word,
                            type="mispronunciation",
                            phoneticHint=to_phonetic_hint(ref_word),
                            confidence=conf_pct,
                            startSec=round(sw["start"], 2),
                            endSec=round(sw["end"], 2),
                        )
                    )
                    word_accuracy_scores.append(max(55.0, prob * 88.0))
                else:
                    miscue_words.append(
                        MiscueWord(
                            word=ref_word,
                            confidence=conf_pct,
                            startSec=round(sw["start"], 2),
                            endSec=round(sw["end"], 2),
                        )
                    )
                    word_accuracy_scores.append(min(100.0, max(75.0, prob * 102.0)))
            elif dist <= max_allowed:
                matched_count += 1
                similarity = max(0.35, 1.0 - (dist / max(1, len(ref_lower))))
                word_accuracy_scores.append(max(42.0, similarity * prob * 86.0))
                miscue_words.append(
                    MiscueWord(
                        word=ref_word,
                        type="mispronunciation",
                        phoneticHint=to_phonetic_hint(ref_word),
                        confidence=conf_pct,
                        startSec=round(sw["start"], 2),
                        endSec=round(sw["end"], 2),
                    )
                )
            else:
                # Completely mismatched substitution -> mark reference word as mispronounced
                word_accuracy_scores.append(25.0)
                miscue_words.append(
                    MiscueWord(
                        word=ref_word,
                        type="mispronunciation",
                        phoneticHint=to_phonetic_hint(ref_word),
                        confidence=conf_pct,
                        startSec=round(sw["start"], 2),
                        endSec=round(sw["end"], 2),
                    )
                )
        elif op == "OMIT":
            ref_word = clean_ref_tokens[r_idx]
            word_accuracy_scores.append(0.0)
            miscue_words.append(MiscueWord(word=ref_word, type="omission"))
        elif op == "INSERT":
            sw = spoken_words[s_idx]
            insertion_count += 1
            conf_pct = int(round(min(100.0, max(10.0, sw["prob"] * 100.0))))
            miscue_words.append(
                MiscueWord(
                    word=sw["word"],
                    type="insertion",
                    confidence=conf_pct,
                    startSec=round(sw["start"], 2),
                    endSec=round(sw["end"], 2),
                )
            )

    total_ref = len(clean_ref_tokens)
    completeness = int(round(min(100.0, (matched_count / total_ref) * 100.0)))
    raw_accuracy = float(np.mean(word_accuracy_scores)) if word_accuracy_scores else 0.0
    insertion_penalty = min(15.0, insertion_count * 3.0)
    accuracy = int(round(min(99.0, max(0.0, raw_accuracy - insertion_penalty))))

    # Fluency: inter-word pause penalties + WPM cadence
    first_start = spoken_words[0]["start"]
    last_end = spoken_words[-1]["end"]
    speech_span_sec = max(0.5, last_end - first_start)
    wpm = (len(spoken_words) / speech_span_sec) * 60.0
    spoken_wpm = int(round(wpm))

    total_pause_penalty = 0.0
    for i in range(1, len(spoken_words)):
        gap = max(0.0, spoken_words[i]["start"] - spoken_words[i - 1]["end"])
        if gap > 0.55:
            total_pause_penalty += min(18.0, (gap - 0.45) * 16.0)

    # Ideal English shadowing WPM is 105 - 175 WPM
    if 105 <= wpm <= 175:
        wpm_score = 94.0
    elif wpm < 105:
        wpm_score = max(45.0, 94.0 - (105.0 - wpm) * 0.55)
    else:
        wpm_score = max(60.0, 94.0 - (wpm - 175.0) * 0.35)

    fluency = int(
        round(
            min(
                99.0,
                max(
                    20.0,
                    (wpm_score - total_pause_penalty) * (0.4 + 0.6 * (completeness / 100.0)),
                ),
            )
        )
    )

    # Prosody: combines waveform modulation + word probability stress variation + fluency
    probs = [w["prob"] for w in spoken_words]
    prob_std = float(np.std(probs)) if len(probs) > 1 else 0.05
    acoustic_prosody = acoustic["prosody_score"] or 76
    prosody = int(
        round(
            min(
                98.0,
                max(
                    25.0,
                    (acoustic_prosody * 0.55 + fluency * 0.30 + min(95.0, 75.0 + prob_std * 100.0) * 0.15)
                    * (0.35 + 0.65 * (completeness / 100.0)),
                ),
            )
        )
    )

    # SRS 8.2 Weighted Battle Score
    battle_score = int(
        round(0.35 * accuracy + 0.25 * fluency + 0.20 * completeness + 0.20 * prosody)
    )

    return AssessmentResponse(
        accuracy=accuracy,
        fluency=fluency,
        completeness=completeness,
        prosody=prosody,
        battleScore=battle_score,
        words=miscue_words,
        recognizedText=recognized_text,
        spokenWpm=spoken_wpm,
        engine="faster-whisper",
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
