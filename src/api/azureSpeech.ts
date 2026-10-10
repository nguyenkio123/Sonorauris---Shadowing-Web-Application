import { calculateBattleScore } from '../config/scoring'
import type { AssessmentResult, MiscueWord } from '../types/attempt'
import { generateAssessmentResult, generateMockMiscues } from './mockServer'

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus'

export interface AnnotatedAudioBlob extends Blob {
  recognizedText?: string
}

interface AzureWordResponse {
  Word: string
  Offset?: number
  Duration?: number
  PronunciationAssessment?: {
    AccuracyScore: number
    ErrorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation'
  }
  Phonemes?: Array<{
    Phoneme: string
    PronunciationAssessment?: {
      AccuracyScore: number
    }
  }>
}

interface AzureSpeechResponse {
  RecognitionStatus: string
  DisplayText?: string
  NBest?: Array<{
    Confidence: number
    Lexical: string
    ITN: string
    MaskedITN: string
    Display: string
    PronunciationAssessment: {
      AccuracyScore: number
      FluencyScore: number
      CompletenessScore: number
      ProsodyScore?: number
      PronScore: number
    }
    Words?: AzureWordResponse[]
  }>
}

/**
 * Checks whether Azure Speech credentials are configured.
 */
export function isAzureSpeechConfigured(): boolean {
  return Boolean(AZURE_KEY && AZURE_REGION)
}

/**
 * Decodes a browser audio Blob into an AudioBuffer for WAV encoding and acoustic analysis.
 */
async function decodeAudioBlob(audioBlob: Blob): Promise<AudioBuffer | null> {
  if (typeof window === 'undefined' || !audioBlob || audioBlob.size < 256) {
    return null
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null

  const ctx = new AudioCtx()
  try {
    const arrayBuffer = await audioBlob.arrayBuffer()
    return await ctx.decodeAudioData(arrayBuffer)
  } catch {
    return null
  } finally {
    if (ctx.state !== 'closed') {
      void ctx.close().catch(() => {})
    }
  }
}

/**
 * Converts an AudioBuffer to 16kHz 16-bit mono PCM WAV Blob required by Azure Speech REST v1.
 */
function encodeWav16kMono(audioBuffer: AudioBuffer): Blob {
  const targetSampleRate = 16000
  const sourceRate = audioBuffer.sampleRate
  const channelData = audioBuffer.getChannelData(0)
  const ratio = sourceRate / targetSampleRate
  const numSamples = Math.max(1, Math.floor(channelData.length / ratio))

  const wavBuffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(wavBuffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM format = 1
  view.setUint16(22, 1, true) // Mono = 1 channel
  view.setUint32(24, targetSampleRate, true)
  view.setUint32(28, targetSampleRate * 2, true) // Byte rate
  view.setUint16(32, 2, true) // Block align
  view.setUint16(34, 16, true) // 16-bit samples
  writeStr(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const srcIdx = Math.min(channelData.length - 1, Math.floor(i * ratio))
    const sample = Math.max(-1, Math.min(1, channelData[srcIdx]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }

  return new Blob([wavBuffer], { type: 'audio/wav; codecs=audio/pcm; samplerate=16000' })
}

/**
 * Evaluates real acoustic signal properties (RMS energy, voiced duration, syllable bursts,
 * prosodic pitch/energy variance) combined with live Web Speech recognized transcript.
 */
function evaluateAcousticSignal(
  audioBuffer: AudioBuffer,
  referenceText: string,
  recognizedText?: string,
  targetScore?: number
): AssessmentResult {
  if (targetScore !== undefined) {
    return generateAssessmentResult(referenceText, targetScore)
  }

  const samples = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const frameSize = Math.max(1, Math.floor(sampleRate * 0.05)) // 50ms frames
  const frameRms: number[] = []

  for (let i = 0; i < samples.length; i += frameSize) {
    const end = Math.min(samples.length, i + frameSize)
    let sumSq = 0
    for (let j = i; j < end; j++) {
      sumSq += samples[j] * samples[j]
    }
    frameRms.push(Math.sqrt(sumSq / (end - i)))
  }

  const noiseFloor = 0.007
  const voicedFrames = frameRms.filter((r) => r > noiseFloor)
  const voicedDurationSec = voicedFrames.length * 0.05
  const totalDurationSec = Math.max(0.1, audioBuffer.duration)
  const peakRms = frameRms.reduce((max, r) => (r > max ? r : max), 0)
  const hasSpokenWords = Boolean(recognizedText && recognizedText.trim().length > 0)

  // Silence guard: if user stayed silent (<0.35s voiced speech and no recognized words)
  if ((voicedDurationSec < 0.35 || peakRms < 0.01) && !hasSpokenWords) {
    return {
      accuracy: 0,
      fluency: 0,
      completeness: 0,
      prosody: 0,
      battleScore: 0,
      words: generateMockMiscues(referenceText, 0, 0),
    }
  }

  const refWords = referenceText
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  const wordCount = Math.max(1, refWords.length)
  const expectedDurationSec = Math.max(1.8, wordCount / 2.4)

  // Count speech syllable/phrase bursts
  let bursts = 0
  let inBurst = false
  for (const rms of frameRms) {
    if (rms > noiseFloor * 1.3 && !inBurst) {
      bursts++
      inBurst = true
    } else if (rms <= noiseFloor) {
      inBurst = false
    }
  }

  const avgVoicedRms =
    voicedFrames.length > 0
      ? voicedFrames.reduce((a, b) => a + b, 0) / voicedFrames.length
      : 0.01
  const variance =
    voicedFrames.length > 1
      ? voicedFrames.reduce((acc, r) => acc + Math.pow(r - avgVoicedRms, 2), 0) /
        voicedFrames.length
      : 0
  const dynModulation = Math.sqrt(variance) / Math.max(0.005, avgVoicedRms)

  // 1. Completeness: derived from spoken word alignment (if available) + voiced duration coverage
  const durationCoverage = Math.min(1.05, voicedDurationSec / expectedDurationSec)
  let completeness = Math.round(Math.min(98, Math.max(25, durationCoverage * 94)))

  // 2. Fluency: derived from active speech continuity ratio & burst pacing
  const voicedRatio = Math.min(1, voicedDurationSec / totalDurationSec)
  const fluencyRatioScore =
    voicedRatio >= 0.45 && voicedRatio <= 0.88
      ? 88 + Math.round((1 - Math.abs(0.68 - voicedRatio)) * 10)
      : Math.round(45 + voicedRatio * 45)
  const fluency = Math.min(98, Math.max(30, fluencyRatioScore))

  // 3. Prosody: derived from natural vocal energy/stress modulation (neither monotone nor erratic)
  const prosodyModScore =
    dynModulation >= 0.25 && dynModulation <= 0.95
      ? 84 + Math.round(Math.min(14, dynModulation * 14))
      : 72
  const prosody = Math.min(98, Math.max(35, Math.round((prosodyModScore + fluency) / 2)))

  // 4. Accuracy: derived from lexical word alignment (when Web Speech recognizedText is present) + clarity
  const miscueWords = generateMockMiscues(referenceText, 88, completeness, recognizedText)
  let accuracy: number

  if (hasSpokenWords) {
    const cleanCount = miscueWords.filter((w) => !w.type).length
    const mispronouncedCount = miscueWords.filter((w) => w.type === 'mispronunciation').length
    const lexicalRatio = (cleanCount + mispronouncedCount * 0.5) / wordCount
    completeness = Math.min(
      99,
      Math.max(20, Math.round(((cleanCount + mispronouncedCount) / wordCount) * 98))
    )
    accuracy = Math.min(
      98,
      Math.max(25, Math.round(lexicalRatio * 82 + Math.min(16, avgVoicedRms * 180)))
    )
  } else {
    const clarityBonus = Math.min(15, Math.round(avgVoicedRms * 160))
    const burstAlignment = Math.min(1, bursts / Math.max(1, wordCount * 0.45))
    accuracy = Math.min(
      96,
      Math.max(35, Math.round(durationCoverage * 55 + burstAlignment * 26 + clarityBonus))
    )
  }

  const finalWords = hasSpokenWords
    ? miscueWords
    : generateMockMiscues(referenceText, accuracy, completeness)
  const battleScore = calculateBattleScore(accuracy, fluency, completeness, prosody)

  return {
    accuracy,
    fluency,
    completeness,
    prosody,
    battleScore,
    words: finalWords,
  }
}

/**
 * SRS Section 8.1 & NFR-10:
 * Microsoft Azure Speech Pronunciation Assessment API Adapter + WebAudio Acoustic Engine.
 *
 * Evaluates audio speech against standard reference text on 4 criteria:
 * - Accuracy (35%)
 * - Fluency (25%)
 * - Completeness (20%)
 * - Prosody (20%)
 */
export async function assessPronunciation(
  audioBlob: Blob,
  referenceText: string,
  targetScore?: number
): Promise<AssessmentResult> {
  const recognizedText = (audioBlob as AnnotatedAudioBlob)?.recognizedText
  const decodedBuffer = await decodeAudioBlob(audioBlob)

  if (!isAzureSpeechConfigured()) {
    if (decodedBuffer) {
      return evaluateAcousticSignal(decodedBuffer, referenceText, recognizedText, targetScore)
    }
    return generateAssessmentResult(referenceText, targetScore)
  }

  try {
    const assessmentParams = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Word',
      Dimension: 'Comprehensive',
      EnableMiscue: true,
    }

    // Base64-encode JSON parameters for Azure custom header
    const jsonString = JSON.stringify(assessmentParams)
    const base64Params = btoa(unescape(encodeURIComponent(jsonString)))

    // Convert WebM recording to 16kHz 16-bit mono PCM WAV for Azure Speech REST API v1 compatibility
    const payloadBlob = decodedBuffer ? encodeWav16kMono(decodedBuffer) : audioBlob
    const contentType = decodedBuffer
      ? 'audio/wav; codecs=audio/pcm; samplerate=16000'
      : audioBlob.type || 'audio/webm; codecs=opus'

    const endpoint = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY!,
        'Pronunciation-Assessment': base64Params,
        'Content-Type': contentType,
        Accept: 'application/json',
      },
      body: payloadBlob,
    })

    if (!response.ok) {
      throw new Error(`Azure Speech API error ${response.status}: ${response.statusText}`)
    }

    const data = (await response.json()) as AzureSpeechResponse

    if (data.RecognitionStatus !== 'Success' || !data.NBest || data.NBest.length === 0) {
      throw new Error(`Speech recognition returned status: ${data.RecognitionStatus}`)
    }

    const nbest = data.NBest[0]
    const pa = nbest.PronunciationAssessment

    const accuracy = Math.round(pa.AccuracyScore ?? 0)
    const fluency = Math.round(pa.FluencyScore ?? 0)
    const completeness = Math.round(pa.CompletenessScore ?? 0)
    const prosody = Math.round(pa.ProsodyScore ?? pa.PronScore ?? 0)

    const battleScore = calculateBattleScore(accuracy, fluency, completeness, prosody)

    // Map word-level miscues
    const words: MiscueWord[] = (nbest.Words || []).map((w) => {
      const errorType = w.PronunciationAssessment?.ErrorType

      let type: MiscueWord['type'] | undefined = undefined
      if (errorType === 'Mispronunciation') type = 'mispronunciation'
      else if (errorType === 'Omission') type = 'omission'
      else if (errorType === 'Insertion') type = 'insertion'

      let phoneticHint: string | undefined = undefined
      if (w.Phonemes && w.Phonemes.length > 0) {
        phoneticHint = `/${w.Phonemes.map((p) => p.Phoneme).join('')}/`
      }

      return {
        word: w.Word,
        type,
        phoneticHint,
      }
    })

    return {
      accuracy,
      fluency,
      completeness,
      prosody,
      battleScore,
      words,
    }
  } catch (err) {
    console.warn('[AzureSpeech] Assessment request failed, falling back to local acoustic engine:', err)
    if (decodedBuffer) {
      return evaluateAcousticSignal(decodedBuffer, referenceText, recognizedText, targetScore)
    }
    return generateAssessmentResult(referenceText, targetScore)
  }
}
