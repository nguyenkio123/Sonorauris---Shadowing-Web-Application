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


class AssessmentResponse(BaseModel):
    accuracy: int
    fluency: int
    completeness: int
    prosody: int
    battleScore: int
    words: List[MiscueWord]
    recognizedText: str
    engine: str = "faster-whisper-base.en"


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
        )

    recognized_text = " ".join(w["word"] for w in spoken_words)

    # Align reference words with spoken words & probabilities
    used_indices = set()
    miscue_words: List[MiscueWord] = []
    word_accuracy_scores: List[float] = []
    matched_count = 0

    for ref_idx, ref_word in enumerate(clean_ref_tokens):
        ref_lower = ref_word.lower()

        # 1. Look for exact match within reasonable window
        best_exact_idx = -1
        for s_idx, sw in enumerate(spoken_words):
            if s_idx in used_indices:
                continue
            if sw["lower"] == ref_lower:
                best_exact_idx = s_idx
                break

        if best_exact_idx != -1:
            used_indices.add(best_exact_idx)
            matched_count += 1
            prob = spoken_words[best_exact_idx]["prob"]
            # If Whisper probability is low (< 0.68), pronunciation was slurred/unclear
            if prob < 0.68 and len(ref_lower) >= 4:
                miscue_words.append(
                    MiscueWord(
                        word=ref_word,
                        type="mispronunciation",
                        phoneticHint=to_phonetic_hint(ref_word),
                    )
                )
                word_accuracy_scores.append(max(55.0, prob * 88.0))
            else:
                miscue_words.append(MiscueWord(word=ref_word))
                word_accuracy_scores.append(min(100.0, max(75.0, prob * 102.0)))
            continue

        # 2. Look for fuzzy match (mispronunciation)
        best_fuzzy_idx = -1
        best_dist = 999
        max_allowed = 2 if len(ref_lower) >= 5 else 1
        for s_idx, sw in enumerate(spoken_words):
            if s_idx in used_indices:
                continue
            dist = edit_distance(ref_lower, sw["lower"])
            if dist <= max_allowed and dist < best_dist:
                best_dist = dist
                best_fuzzy_idx = s_idx

        if best_fuzzy_idx != -1:
            used_indices.add(best_fuzzy_idx)
            matched_count += 1
            prob = spoken_words[best_fuzzy_idx]["prob"]
            similarity = max(0.3, 1.0 - (best_dist / max(1, len(ref_lower))))
            word_accuracy_scores.append(max(40.0, similarity * prob * 85.0))
            miscue_words.append(
                MiscueWord(
                    word=ref_word,
                    type="mispronunciation",
                    phoneticHint=to_phonetic_hint(ref_word),
                )
            )
        else:
            # 3. Omission
            word_accuracy_scores.append(0.0)
            miscue_words.append(MiscueWord(word=ref_word, type="omission"))

    total_ref = len(clean_ref_tokens)
    completeness = int(round(min(100.0, (matched_count / total_ref) * 100.0)))
    accuracy = int(round(min(99.0, max(0.0, float(np.mean(word_accuracy_scores))))))

    # Fluency: inter-word pause penalties + WPM cadence
    first_start = spoken_words[0]["start"]
    last_end = spoken_words[-1]["end"]
    speech_span_sec = max(0.5, last_end - first_start)
    wpm = (len(spoken_words) / speech_span_sec) * 60.0

    long_pauses = 0
    total_pause_penalty = 0.0
    for i in range(1, len(spoken_words)):
        gap = max(0.0, spoken_words[i]["start"] - spoken_words[i - 1]["end"])
        if gap > 0.55:
            long_pauses += 1
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
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
