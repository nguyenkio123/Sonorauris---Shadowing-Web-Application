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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)

  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // Clean up object URLs and active stream tracks on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [audioUrl])

  // Stop recording automatically when maxDuration is reached
  useEffect(() => {
    if (state === 'recording' && elapsedSec >= maxDurationSec + 1) {
      handleStop()
    }
  }, [elapsedSec, maxDurationSec, state, handleStop])

  const handleStart = async () => {
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
        })
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
      setState('denied')
    }
  }

  const handleRecordAgain = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    recordedBlobRef.current = null
    setElapsedSec(0)
    setState('idle')
  }

  const handleSubmit = () => {
    if (!recordedBlobRef.current || submitting) return
    onSubmit(recordedBlobRef.current)
  }

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
            title="Click to start recording"
          >
            <span className="absolute inset-0 rounded-full bg-[#4E9488]/20 group-hover:scale-110 transition-transform duration-200" />
            <Mic className="h-8 w-8 text-white relative z-10" />
          </button>
          <p className="mt-4 text-[15px] font-semibold text-[#171B2A]">
            Click to Start Recording
          </p>
          <p className="text-xs text-[#5B6780] mt-1">
            Max duration: <span className="font-mono font-medium text-[#171B2A]">{maxDurationSec}s</span>
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
              title="Click to stop recording"
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

          {/* Animated audio level bars — Turquoise & Navy */}
          <div className="mt-3.5 flex items-center gap-1.5 h-6">
            <span className="w-1.5 bg-[#4E9488] rounded-full h-3 animate-bounce" />
            <span className="w-1.5 bg-[#171B2A] rounded-full h-5 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 bg-[#4E9488] rounded-full h-2 animate-bounce [animation-delay:0.3s]" />
            <span className="w-1.5 bg-[#171B2A] rounded-full h-6 animate-bounce [animation-delay:0.45s]" />
            <span className="w-1.5 bg-[#4E9488] rounded-full h-4 animate-bounce [animation-delay:0.2s]" />
          </div>

          <p className="mt-3 text-xs text-[#5B6780]">
            Speaking now... Click black square to finish.
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
