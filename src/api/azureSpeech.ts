import { calculateBattleScore } from '../config/scoring'
import type { AssessmentResult, MiscueWord } from '../types/attempt'
import { generateAssessmentResult } from './mockServer'

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus'

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
 * SRS Section 8.1 & NFR-10:
 * Microsoft Azure Speech Pronunciation Assessment API Adapter.
 *
 * Evaluates audio speech against standard reference text on 4 criteria:
 * - Accuracy (35%)
 * - Fluency (25%)
 * - Completeness (20%)
 * - Prosody (20%)
 *
 * If credentials are not configured or network fails, gracefully falls back
 * to the deterministic local mock engine (NFR-05 & NFR-10).
 */
export async function assessPronunciation(
  audioBlob: Blob,
  referenceText: string,
  targetScore?: number
): Promise<AssessmentResult> {
  if (!isAzureSpeechConfigured()) {
    console.info(
      '[AzureSpeech] Running in fallback mode. (Add VITE_AZURE_SPEECH_KEY to .env for live cloud assessment).'
    )
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

    const endpoint = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY!,
        'Pronunciation-Assessment': base64Params,
        'Content-Type': audioBlob.type || 'audio/webm; codecs=opus',
        Accept: 'application/json',
      },
      body: audioBlob,
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

    const accuracy = Math.round(pa.AccuracyScore || 80)
    const fluency = Math.round(pa.FluencyScore || 80)
    const completeness = Math.round(pa.CompletenessScore || 80)
    const prosody = Math.round(pa.ProsodyScore || pa.PronScore || 80)

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
    console.warn('[AzureSpeech] Assessment request failed, falling back to local engine:', err)
    return generateAssessmentResult(referenceText, targetScore)
  }
}
