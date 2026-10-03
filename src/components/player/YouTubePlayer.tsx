import { ExternalLink, Play, RotateCcw, AlertTriangle, Pause } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  destroy: () => void
}

interface YouTubePlayerProps {
  videoId: string
  title: string
  thumbnailUrl: string
  sourceUrl: string
  startTimeSec: number
  endTimeSec: number
  onSegmentEnd?: () => void
  autoPlay?: boolean
}

export function YouTubePlayer({
  videoId,
  title,
  thumbnailUrl,
  sourceUrl,
  startTimeSec,
  endTimeSec,
  onSegmentEnd,
  autoPlay = false,
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const timerRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const stopBoundaryCheck = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startBoundaryCheck = useCallback(() => {
    stopBoundaryCheck()
    timerRef.current = window.setInterval(() => {
      if (!playerRef.current) return
      try {
        const current = playerRef.current.getCurrentTime()
        if (current >= endTimeSec) {
          playerRef.current.pauseVideo()
          playerRef.current.seekTo(startTimeSec, true)
          setIsPlaying(false)
          stopBoundaryCheck()
          if (onSegmentEnd) onSegmentEnd()
        }
      } catch {
        // ignore
      }
    }, 200)
  }, [endTimeSec, startTimeSec, stopBoundaryCheck, onSegmentEnd])

  // Initialize YouTube IFrame API
  useEffect(() => {
    let isCancelled = false
    const currentMount = mountRef.current

    const initPlayer = () => {
      if (!currentMount || !window.YT || !window.YT.Player || isCancelled) return

      try {
        // Clean up previous instance
        if (playerRef.current) {
          try {
            playerRef.current.destroy()
          } catch {
            // ignore
          }
          playerRef.current = null
        }

        // Clean out mount container DOM directly to isolate from React reconciliation
        currentMount.innerHTML = ''

        // Create a dedicated child element for YouTube to replace
        const playerSlot = document.createElement('div')
        playerSlot.style.width = '100%'
        playerSlot.style.height = '100%'
        currentMount.appendChild(playerSlot)

        playerRef.current = new window.YT.Player(playerSlot, {
          videoId,
          playerVars: {
            start: startTimeSec,
            end: endTimeSec,
            autoplay: autoPlay ? 1 : 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (isCancelled) return
              setIsReady(true)
              // Cue segment start frame immediately so user sees the speaker
              event.target.seekTo(startTimeSec, true)
              if (autoPlay) {
                event.target.playVideo()
              }
            },
            onStateChange: (event) => {
              if (isCancelled) return
              if (event.data === 1) {
                // Guard: if user clicked native YouTube play button outside segment bounds, snap to start
                try {
                  const current = event.target?.getCurrentTime ? event.target.getCurrentTime() : 0
                  if (current < startTimeSec - 1 || current >= endTimeSec) {
                    event.target?.seekTo?.(startTimeSec, true)
                  }
                } catch {
                  // ignore
                }
                setIsPlaying(true)
                startBoundaryCheck()
              } else {
                setIsPlaying(false)
                stopBoundaryCheck()
              }
            },
            onError: (event) => {
              if (isCancelled) return
              console.warn('[YouTubePlayer] YouTube API reported error code:', event.data)
              setHasError(true)
              if (event.data === 101 || event.data === 150) {
                setErrorMessage('The video owner has restricted external embedding for this clip.')
              } else {
                setErrorMessage('Video embedding is currently unavailable.')
              }
            },
          },
        })
      } catch (err) {
        if (!isCancelled) {
          console.error('[YouTubePlayer] Initialization exception:', err)
          setHasError(true)
          setErrorMessage('Could not initialize video player.')
        }
      }
    }

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api')
      if (!existingScript) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
      }

      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback()
        initPlayer()
      }
    } else {
      initPlayer()
    }

    return () => {
      isCancelled = true
      stopBoundaryCheck()
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // ignore
        }
        playerRef.current = null
      }
      if (currentMount) {
        currentMount.innerHTML = ''
      }
    }
  }, [videoId, startTimeSec, endTimeSec, autoPlay, startBoundaryCheck, stopBoundaryCheck])

  const handlePlaySegment = () => {
    if (!playerRef.current) return
    playerRef.current.seekTo(startTimeSec, true)
    playerRef.current.playVideo()
    setIsPlaying(true)
  }

  const handlePause = () => {
    if (!playerRef.current) return
    playerRef.current.pauseVideo()
    setIsPlaying(false)
  }

  const handleReplay = () => {
    handlePlaySegment()
  }

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#dddddd] bg-white airbnb-shadow">
      {/* 
        CRITICAL ARCHITECTURE: 
        The mount container is ALWAYS kept in the React DOM.
        We toggle visibility via CSS ('hidden' / 'block') instead of unmounting.
        This completely prevents React DOM from throwing 'removeChild' error when YouTube mutates inner DOM nodes.
      */}
      <div className={`relative aspect-video w-full bg-black ${hasError ? 'hidden' : 'block'}`}>
        <div ref={mountRef} className="h-full w-full" />
      </div>

      {/* Fallback View: Shown gracefully when video has embed restrictions (e.g. Error 150) */}
      {hasError && (
        <div className="relative aspect-video w-full overflow-hidden bg-[#f7f7f7] flex flex-col items-center justify-center p-6 text-center">
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xs"
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3 border border-amber-500/30 shadow-xs">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-[#222222] mb-1">
              YouTube Embed Restricted (Error 150)
            </h4>
            <p className="max-w-md text-xs text-[#6a6a6a] mb-4 leading-relaxed">
              {errorMessage || 'This video does not allow third-party iframe embedding.'}
              <br />
              <span className="text-[#222222] font-medium">
                You can still practice shadowing using the target transcript below!
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex items-center gap-2 text-xs font-medium h-[40px] px-4 rounded-lg"
              >
                <span>Watch Directly on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Segment Control Toolbar — Airbnb Clean Style */}
      <div className="flex items-center justify-between border-t border-[#ebebeb] bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          {isPlaying ? (
            <button
              type="button"
              onClick={handlePause}
              disabled={!isReady || hasError}
              className="flex items-center gap-2 rounded-full bg-[#222222] hover:bg-black px-4 py-2 text-xs font-medium text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <Pause className="h-4 w-4 fill-white" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaySegment}
              disabled={!isReady || hasError}
              className="btn-pill-rausch flex items-center gap-2 text-xs font-semibold px-4 py-2"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Play Segment</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReplay}
            disabled={!isReady || hasError}
            className="flex items-center gap-1.5 rounded-full border border-[#dddddd] bg-white hover:bg-[#f7f7f7] px-3.5 py-2 text-xs font-medium text-[#222222] transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6a6a6a]">
          <span className="font-mono bg-[#f7f7f7] border border-[#dddddd] px-3 py-1 rounded-full text-[#222222] font-semibold">
            {startTimeSec}s – {endTimeSec}s ({endTimeSec - startTimeSec}s)
          </span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 hover:text-[#4E9488] transition-colors"
            title="Open original video on YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
