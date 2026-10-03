import { useEffect, useState } from 'react'
import { BookOpen, Volume2, X } from 'lucide-react'
import { lookupWord, playWordPronunciation, type DictionaryEntry } from '../../api/dictionary'

interface DictionaryModalProps {
  word: string | null
  onClose: () => void
}

export function DictionaryModal({ word, onClose }: DictionaryModalProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!word) {
      setEntry(null)
      return
    }

    let isMounted = true
    setLoading(true)

    void lookupWord(word).then((data) => {
      if (isMounted) {
        setEntry(data)
        setLoading(false)
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      isMounted = false
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [word, onClose])

  if (!word) return null

  const handlePlayAudio = () => {
    if (!entry) return
    setPlaying(true)
    playWordPronunciation(entry.word, entry.audioUrl)
    setTimeout(() => setPlaying(false), 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[18px] bg-white border border-[#ebebeb] p-6 airbnb-shadow text-[#222222] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] transition-colors"
          title="Close dictionary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4E9488] mb-2">
          <BookOpen className="h-4 w-4" />
          <span>TRANSCRIPT DICTIONARY</span>
          <span className="new-tag">FR-DICT-01</span>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-xs text-[#5B6780]">
            <span className="h-6 w-6 rounded-full border-2 border-[#4E9488]/30 border-t-[#4E9488] animate-spin mb-2" />
            Looking up definition for "{word}"...
          </div>
        ) : entry ? (
          <div>
            {/* Word & Pronunciation row */}
            <div className="flex items-center justify-between gap-3 mt-1 pb-3 border-b border-[#ebebeb]">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-[#171B2A] capitalize">
                    {entry.word}
                  </h3>
                  {entry.partOfSpeech && (
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#f7f9fa] text-[#5B6780] border border-[#ebebeb]">
                      {entry.partOfSpeech}
                    </span>
                  )}
                </div>
                {entry.phonetic && (
                  <span className="text-sm font-mono text-[#5B6780] mt-0.5 block">
                    {entry.phonetic}
                  </span>
                )}
              </div>

              {/* Pronounce Button */}
              <button
                onClick={handlePlayAudio}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-full border transition-all ${
                  playing
                    ? 'bg-[#4E9488] text-white border-[#4E9488] scale-105'
                    : 'bg-[#f7f9fa] text-[#171B2A] border-[#ebebeb] hover:border-[#c1c1c1]'
                }`}
                title="Listen to pronunciation"
              >
                <Volume2 className="h-4 w-4" />
                <span className="text-xs font-medium">Listen</span>
              </button>
            </div>

            {/* Definition */}
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6780] block mb-1">
                Definition
              </span>
              <p className="text-sm text-[#171B2A] leading-relaxed">
                {entry.definition}
              </p>
            </div>

            {/* Example sentence if available */}
            {entry.example && (
              <div className="mt-4 p-3 rounded-xl bg-[#f7f9fa] border-l-3 border-[#4E9488] text-xs text-[#283044] italic leading-relaxed">
                "{entry.example}"
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-[#ebebeb] flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Done Reading
              </button>
            </div>
          </div>
        ) : (
          <p className="py-4 text-xs text-[#6a6a6a]">Could not load definition.</p>
        )}
      </div>
    </div>
  )
}
