import { Globe, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-[#ebebeb] bg-white text-[#222222] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 3-Column Editorial Links Grid (Support / Practice / Sonorauris) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#ebebeb]">
          {/* Column 1: Learning & Methods */}
          <div>
            <h4 className="text-sm font-semibold text-[#222222] mb-3">
              Shadowing Method
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
              <li>
                <a href="#about-shadowing" className="hover:text-[#222222] transition-colors">
                  What is Spoken Shadowing?
                </a>
              </li>
              <li>
                <a href="#rhythm-cadence" className="hover:text-[#222222] transition-colors">
                  Speech Rhythm &amp; Intonation
                </a>
              </li>
              <li>
                <a href="#four-dimensions" className="hover:text-[#222222] transition-colors">
                  4 Core Assessment Dimensions
                </a>
              </li>
              <li>
                <a href="#accent-reduction" className="hover:text-[#222222] transition-colors">
                  Natural English Cadence
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Competitive Arena */}
          <div>
            <h4 className="text-sm font-semibold text-[#222222] mb-3">
              Competitive Arena
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
              <li>
                <a href="/battle/lobby" className="hover:text-[#222222] transition-colors">
                  1v1 Real-Time Matchmaking
                </a>
              </li>
              <li>
                <a href="/battle/lobby" className="hover:text-[#222222] transition-colors">
                  ShadowBot AI Opponents
                </a>
              </li>
              <li>
                <a href="#ledger" className="hover:text-[#222222] transition-colors">
                  Idempotent Coins &amp; XP Ledger
                </a>
              </li>
              <li>
                <a href="#room-codes" className="hover:text-[#222222] transition-colors">
                  Room Code Invitation Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Sonorauris Platform */}
          <div>
            <h4 className="text-sm font-semibold text-[#222222] mb-3">
              Audio &amp; Technology
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
              <li>
                <span className="flex items-center gap-1.5 text-[#222222] font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-[#4E9488]" />
                  <span>AI Pronunciation Engine</span>
                </span>
              </li>
              <li className="text-xs text-[#6a6a6a] leading-relaxed pt-1">
                Sub-second audio alignment assessing Accuracy, Fluency, Completeness, and Prosody against authentic reference audio.
              </li>
              <li className="pt-2">
                <a href="#microphone-guide" className="hover:text-[#222222] transition-colors">
                  Microphone Calibration Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Band Strip — DESIGN.md legal-band */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[13px] text-[#6a6a6a]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 Sonorauris, Inc.</span>
            <span>·</span>
            <a href="#privacy" className="hover:underline hover:text-[#222222]">Privacy</a>
            <span>·</span>
            <a href="#terms" className="hover:underline hover:text-[#222222]">Terms</a>
            <span>·</span>
            <a href="#sitemap" className="hover:underline hover:text-[#222222]">Sitemap</a>
            <span>·</span>
            <span className="text-[#929292]">English Shadowing Platform</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language & Currency Pickers */}
            <div className="flex items-center gap-3 font-medium text-[#222222]">
              <span className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <Globe className="h-4 w-4 text-[#222222]" />
                <span>English (US)</span>
              </span>
              <span>·</span>
              <span className="cursor-pointer hover:underline">
                $ USD (Coins)
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
