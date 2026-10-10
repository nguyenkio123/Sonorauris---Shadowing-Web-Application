import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldAlert,
  User,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LoginPageProps {
  initialMode?: 'signin' | 'signup'
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'signin' }) => {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Redirect destination
  const redirectTarget =
    (location.state as { from?: string } | null)?.from ||
    searchParams.get('redirect') ||
    '/'

  const handleRedirect = (role?: string) => {
    if (role === 'admin' && redirectTarget === '/') {
      navigate('/admin', { replace: true })
    } else {
      navigate(redirectTarget, { replace: true })
    }
  }

  // If already authenticated with active account, forward immediately
  useEffect(() => {
    if (user && !user.isGuest) {
      handleRedirect(user.role)
    }
  }, [user])

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
          if (res.message.includes('xác thực') || res.message.includes('confirm')) {
            setMode('signin')
          } else {
            setTimeout(() => {
              handleRedirect()
            }, 800)
          }
        } else {
          setErrorMsg(res.message)
        }
      } else {
        const res = await signIn(email, password)
        if (res.success) {
          setSuccessMsg(res.message)
          setTimeout(() => {
            handleRedirect(email.includes('admin') ? 'admin' : undefined)
          }, 600)
        } else {
          setErrorMsg(res.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col justify-between text-[#171B2A] font-sans pb-10">

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md rounded-3xl bg-white border border-[#E2E6EA] p-6 sm:p-8 airbnb-shadow">
          {/* Brand Logo & Title with Two-Tone Styling */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3 group mb-3">
              <img
                src="/logo.jpe"
                alt="Sonorauris Logo"
                className="h-11 w-11 rounded-2xl object-cover border border-[#e2e6ea] shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-2xl tracking-tight leading-none">
                    <span className="text-[#171B2A]">Sonor</span>
                    <span className="text-[#10B981]">auris</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6780] font-normal mt-0.5">
                  English Shadowing Arena
                </p>
              </div>
            </Link>

            <h1 className="text-xl font-bold text-[#171B2A] mt-2">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-xs text-[#5B6780] mt-1 max-w-xs">
              {mode === 'signin'
                ? 'Continue your speech rhythm practice and multiplayer battles'
                : 'Start mastering authentic spoken English cadence and accents'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-[#F7F9FA] border border-[#E2E6EA] p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#171B2A] shadow-xs'
                  : 'text-[#5B6780] hover:text-[#171B2A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 animate-in fade-in duration-150">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#171B2A] mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl border border-[#E2E6EA] bg-white pl-10 pr-3.5 py-2.5 text-xs text-[#171B2A] placeholder-[#5B6780] focus:border-[#4E9488] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171B2A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#E2E6EA] bg-white pl-10 pr-3.5 py-2.5 text-xs text-[#171B2A] placeholder-[#5B6780] focus:border-[#4E9488] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171B2A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6780]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2E6EA] bg-white pl-10 pr-10 py-2.5 text-xs text-[#171B2A] placeholder-[#5B6780] focus:border-[#4E9488] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6780] hover:text-[#171B2A] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <span className="text-[10px] text-[#5B6780] mt-1 block">
                  Password must be at least 6 characters.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary h-[42px] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 transition-all mt-2"
            >
              {submitting ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-[#5B6780]">
        © 2026 Sonorauris — English Shadowing Platform
      </footer>
    </div>
  )
}
