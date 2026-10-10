import { Mic, Square, RotateCcw, Send, AlertCircle, Info, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface AudioRecorderProps {
  maxDurationSec: number
  onSubmit: (audioBlob: Blob) => void
  submitting?: boolean
  disabled?: boolean
}

type RecorderState = 'idle' | 'recording' | 'recorded' | 'denied'

export function AudioRecorder({
  maxDurationSec,
  onSubmit,
  submitting = false,
  disabled = false,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showMicTip, setShowMicTip] = useState(true)
  const [audioLevels, setAudioLevels] = useState<number[]>([22, 22, 22, 22, 22])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const meterTimerRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const recognizedTextRef = useRef<string>('')

  const stopMeter = useCallback(() => {
    if (meterTimerRef.current) {
      clearInterval(meterTimerRef.current)
      meterTimerRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setAudioLevels([22, 22, 22, 22, 22])
  }, [])

  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    stopMeter()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
    }
  }, [stopMeter])

  // Clean up object URLs and active stream tracks on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopMeter()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [audioUrl, stopMeter])

  // Stop recording automatically when maxDuration is reached
  useEffect(() => {
    if (state === 'recording' && elapsedSec >= maxDurationSec + 1) {
      handleStop()
    }
  }, [elapsedSec, maxDurationSec, state, handleStop])

  const handleStart = useCallback(async () => {
    if (disabled || submitting) return

    try {
      // Request mic permission ONLY on explicit button click
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      recognizedTextRef.current = ''

      // Connect real-time Web Audio AnalyserNode so level bars respond to actual voice input
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          audioContextRef.current = ctx
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 32
          analyser.smoothingTimeConstant = 0.65
          source.connect(analyser)
          const dataArray = new Uint8Array(analyser.frequencyBinCount)

          meterTimerRef.current = window.setInterval(() => {
            analyser.getByteFrequencyData(dataArray)
            const bins = [1, 2, 3, 5, 7]
            const nextLevels = bins.map((idx) => {
              const val = dataArray[idx] || 0
              return Math.min(100, Math.max(20, Math.round((val / 220) * 100)))
            })
            setAudioLevels(nextLevels)
          }, 80)
        }
      } catch {
        // Non-blocking if AudioContext is restricted
      }

      // Start parallel Web Speech Recognition (en-US) if supported by browser
      try {
        const SpeechRec =
          (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition
        if (SpeechRec) {
          const recognition = new SpeechRec() as {
            lang: string
            continuous: boolean
            interimResults: boolean
            onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
            start: () => void
            stop: () => void
          }
          recognition.lang = 'en-US'
          recognition.continuous = true
          recognition.interimResults = true
          recognition.onresult = (event) => {
            const parts: string[] = []
            for (let i = 0; i < event.results.length; i++) {
              const item = event.results[i]
              if (item && item[0]?.transcript) {
                parts.push(item[0].transcript)
              }
            }
            recognizedTextRef.current = parts.join(' ').trim()
          }
          recognition.start()
          recognitionRef.current = recognition
        }
      } catch {
        // Non-blocking if browser speech recognition is unavailable
      }

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        }) as Blob & { recognizedText?: string }
        if (recognizedTextRef.current) {
          audioBlob.recognizedText = recognizedTextRef.current
        }
        recordedBlobRef.current = audioBlob
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setState('recorded')

        // Stop stream hardware tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
      }

      recorder.start(100)
      setState('recording')
      setElapsedSec(0)

      timerRef.current = window.setInterval(() => {
        setElapsedSec((prev) => prev + 1)
      }, 1000)
    } catch (err: unknown) {
      console.warn('[AudioRecorder] Mic permission error:', err)
      stopMeter()
      setState('denied')
    }
  }, [audioUrl, disabled, submitting, stopMeter])

  const handleRecordAgain = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    recordedBlobRef.current = null
    recognizedTextRef.current = ''
    setElapsedSec(0)
    setState('idle')
  }

  const handleSubmit = useCallback(() => {
    if (!recordedBlobRef.current || submitting) return
    onSubmit(recordedBlobRef.current)
  }, [onSubmit, submitting])

  // Keyboard shortcuts: 'r' to toggle record/stop, 'Enter' to submit recorded clip
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        if (state === 'idle' || state === 'recorded') {
          void handleStart()
        } else if (state === 'recording') {
          handleStop()
        }
      } else if (e.key === 'Enter' && state === 'recorded' && tag !== 'button') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state, handleStart, handleStop, handleSubmit])

  return (
    <div className="rounded-[14px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
      {/* Microphone Advice Tip before first recording */}
      {showMicTip && state === 'idle' && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-[#dddddd] bg-[#f7f9fa] p-3.5 text-xs text-[#283044]">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-[#4E9488] mt-0.5" />
            <div>
              <span className="font-semibold text-[#171B2A]">Audio Quality Tip: </span>
              Position your microphone about 15–20 cm from your mouth, speak with a steady natural volume, and avoid background noise for the most accurate AI feedback.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMicTip(false)}
            aria-label="Dismiss audio quality tip"
            className="text-[#8895AD] hover:text-[#171B2A] font-semibold px-1"
            title="Dismiss tip"
          >
            ✕
          </button>
        </div>
      )}

      {/* Permission Denied Guide */}
      {state === 'denied' && (
        <div className="rounded-xl border border-[#c13515]/30 bg-[#fff5f5] p-4 text-xs text-[#c13515]">
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-[#c13515]" />
            <span>Microphone Access Blocked</span>
          </div>
          <p className="mb-3 text-[#3f3f3f]">
            Your browser prevented access to the microphone. To record your shadowing voice:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#3f3f3f] mb-4 pl-1">
            <li>Click the lock or site settings icon in your browser address bar.</li>
            <li>Switch <strong>Microphone</strong> permission from Blocked to <strong>Allow</strong>.</li>
            <li>Reload the page or click Try Again below.</li>
          </ol>
          <button
            type="button"
            onClick={() => setState('idle')}
            className="btn-primary text-xs h-[36px] px-3.5 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* IDLE STATE */}
      {state === 'idle' && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <button
            type="button"
            onClick={handleStart}
            disabled={disabled || submitting}
            className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#4E9488] hover:bg-[#3D7A70] text-white shadow-md transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Click to start recording (Shortcut: R)"
          >
            <span className="absolute inset-0 rounded-full bg-[#4E9488]/20 group-hover:scale-110 transition-transform duration-200" />
            <Mic className="h-8 w-8 text-white relative z-10" />
          </button>
          <p className="mt-4 text-[15px] font-semibold text-[#171B2A]">
            Click to Start Recording
          </p>
          <p className="text-xs text-[#5B6780] mt-1">
            Max duration: <span className="font-mono font-medium text-[#171B2A]">{maxDurationSec}s</span> · Press <kbd className="rounded border border-[#dddddd] bg-[#f7f9fa] px-1.5 py-0.5 font-mono text-[11px] text-[#171B2A]">R</kbd> to record
          </p>
        </div>
      )}

      {/* RECORDING STATE */}
      {state === 'recording' && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          {/* Pulsing indicator */}
          <div className="relative mb-4 flex items-center justify-center">
            <span className="absolute h-24 w-24 rounded-full bg-[#4E9488]/20 animate-ping" />
            <button
              type="button"
              onClick={handleStop}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#171B2A] hover:bg-black text-white shadow-lg transition-all active:scale-95"
              title="Click to stop recording (Shortcut: R)"
            >
              <Square className="h-7 w-7 fill-white" />
            </button>
          </div>

          {/* Timer and Waveform animation */}
          <div className="flex items-center gap-2 text-base font-mono font-bold text-[#171B2A]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4E9488] animate-pulse" />
            <span>
              00:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec} / 00:{maxDurationSec < 10 ? `0${maxDurationSec}` : maxDurationSec}
            </span>
          </div>

          {/* Live Web Audio AnalyserNode level bars — Turquoise & Navy */}
          <div
            aria-label="Live microphone input level"
            className="mt-3.5 flex items-end justify-center gap-1.5 h-7"
          >
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                style={{ height: `${lvl}%` }}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  idx % 2 === 0 ? 'bg-[#4E9488]' : 'bg-[#171B2A]'
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-[#5B6780]">
            {Math.max(...audioLevels) <= 22 && elapsedSec >= 2
              ? 'No voice detected yet — check if your mic is muted.'
              : 'Speaking now... Click square or press R to finish.'}
          </p>
        </div>
      )}

      {/* RECORDED / PLAYBACK STATE */}
      {state === 'recorded' && audioUrl && (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#10b981]">
              <Volume2 className="h-4 w-4" />
              <span>Recording Captured (<span className="font-mono">{elapsedSec}s</span>)</span>
            </div>
            <button
              type="button"
              onClick={handleRecordAgain}
              disabled={submitting}
              className="flex items-center gap-1.5 text-xs font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Record Again</span>
            </button>
          </div>

          {/* Native HTML5 Audio Player */}
          <audio
            src={audioUrl}
            controls
            className="w-full h-10 rounded-xl bg-[#f7f7f7] border border-[#dddddd]"
          />

          {/* Submission CTA — Rausch Primary CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleRecordAgain}
              disabled={submitting}
              className="btn-secondary text-xs font-medium h-[40px] px-4 rounded-lg"
            >
              Re-record
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary text-xs font-semibold h-[40px] px-5 rounded-lg active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Evaluating Speech...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit for AI Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
