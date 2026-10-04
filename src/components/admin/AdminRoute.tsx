import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, ShieldAlert, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toggleCurrentRole } from '../../api/auth'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, signIn, refreshUser } = useAuth()
  const [email, setEmail] = useState('admin@sonorauris.com')
  const [password, setPassword] = useState('admin123')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4E9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#5B6780]">Checking permissions...</span>
        </div>
      </div>
    )
  }

  // Authorized Admin access
  if (user && user.role === 'admin') {
    return <>{children}</>
  }

  // Not logged in as Admin: Render access gate
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      const res = await signIn(email, password)
      if (!res.success) {
        setErrorMsg(res.message)
      } else {
        await refreshUser()
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleElevateCurrentSession = async () => {
    setIsSubmitting(true)
    try {
      await toggleCurrentRole()
      await refreshUser()
    } catch {
      setErrorMsg('Failed to elevate session role.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#F7F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E6EA] shadow-xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#171B2A]">Admin Access Required</h1>
          <p className="text-xs text-[#5B6780] mt-1.5 leading-relaxed">
            This management console is restricted to administrators for managing clips, users, and reward distributions.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Sandbox Elevate (Ideal for Demo / Evaluation) */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-emerald-200 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Sandbox Quick Elevate</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-normal">
            Grant Admin privileges to your current session ({user?.displayName || 'Active User'}) instantly without logging out.
          </p>
          <button
            type="button"
            onClick={handleElevateCurrentSession}
            disabled={isSubmitting}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Elevating...' : '⚡ Switch Current Session to Admin'}
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E6EA]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-[#5B6780]">or sign in as administrator</span>
          </div>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#171B2A] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-sm text-[#171B2A] focus:outline-none focus:border-[#4E9488] focus:ring-1 focus:ring-[#4E9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171B2A] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-[#E2E6EA] text-sm text-[#171B2A] focus:outline-none focus:border-[#4E9488] focus:ring-1 focus:ring-[#4E9488]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl btn-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B6780] hover:text-[#171B2A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sonorauris Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
