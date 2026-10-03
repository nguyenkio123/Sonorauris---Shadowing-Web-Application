import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { isConfigured, signIn, signUp, setGuest } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      if (mode === 'signup') {
        const res = await signUp(email, password, displayName)
        if (res.success) {
          setSuccessMsg(res.message)
          setTimeout(() => {
            onClose()
          }, 1000)
        } else {
          setErrorMsg(res.message)
        }
      } else {
        const res = await signIn(email, password)
        if (res.success) {
          setSuccessMsg(res.message)
          setTimeout(() => {
            onClose()
          }, 800)
        } else {
          setErrorMsg(res.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGuestContinue = () => {
    setGuest()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[20px] bg-white border border-[#ebebeb] p-6 sm:p-8 airbnb-shadow text-[#171B2A] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center text-[#5B6780] hover:bg-[#f7f9fa] hover:text-[#171B2A] transition-colors"
          title="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src="/logo.jpe"
            alt="Sonorauris Logo"
            className="h-10 w-10 rounded-xl object-cover border border-[#e2e6ea] shadow-xs"
          />
          <div>
            <h3 className="text-[20px] font-bold text-[#171B2A] leading-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-xs text-[#5B6780] mt-0.5">
              Sonorauris English Shadowing Platform
            </p>
          </div>
        </div>

        {/* Cloud Connection Badge */}
        <div className="mb-5 p-2.5 rounded-xl bg-[#f7f9fa] border border-[#ebebeb] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[#171B2A]">
              {isConfigured ? 'Cloud Sync Enabled (Supabase)' : 'Local Sandbox Mode (Active)'}
            </span>
          </div>
          <span className="text-[#5B6780]">
            {isConfigured ? 'Live Auth' : 'Zero Setup'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#f7f9fa] p-1 border border-[#ebebeb] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-[#171B2A] shadow-xs'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#171B2A] shadow-xs'
                : 'text-[#5B6780] hover:text-[#171B2A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#171B2A] mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[#dddddd] bg-[#ffffff] pl-10 pr-3.5 py-2.5 text-sm text-[#171B2A] placeholder-[#8A96A8] focus:border-[#4E9488] focus:ring-1 focus:ring-[#4E9488] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#171B2A] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#dddddd] bg-[#ffffff] pl-10 pr-3.5 py-2.5 text-sm text-[#171B2A] placeholder-[#8A96A8] focus:border-[#4E9488] focus:ring-1 focus:ring-[#4E9488] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171B2A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#dddddd] bg-[#ffffff] pl-10 pr-10 py-2.5 text-sm text-[#171B2A] placeholder-[#8A96A8] focus:border-[#4E9488] focus:ring-1 focus:ring-[#4E9488] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6780] hover:text-[#171B2A]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 btn-primary py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#ebebeb]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#5B6780]">or</span>
          </div>
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={handleGuestContinue}
          className="w-full py-2.5 rounded-xl border border-[#dddddd] bg-white hover:bg-[#f7f9fa] text-xs font-semibold text-[#171B2A] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#4E9488]" />
          <span>Continue as Guest (Demo Player)</span>
        </button>

        <p className="mt-4 text-center text-[11px] text-[#5B6780] leading-relaxed">
          By continuing, you agree to Sonorauris Terms of Service and Privacy Policy. All practice rewards are immutably tracked.
        </p>
      </div>
    </div>
  )
}
