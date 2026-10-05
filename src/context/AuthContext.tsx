import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  continueAsGuest,
  getCurrentAuthUser,
  isSupabaseConfigured,
  loginAsDemoPlayer,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../api/auth'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, pass: string) => Promise<{ success: boolean; message: string }>
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  setGuest: () => void
  loginDemo: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  const refreshUser = async () => {
    try {
      const u = await getCurrentAuthUser()
      setUser(u)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshUser()

    // Listen to Supabase auth state change if active
    let authListener: { unsubscribe: () => void } | null = null
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        void refreshUser()
      })
      authListener = data.subscription
    }

    const handleStorage = () => {
      void refreshUser()
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      authListener?.unsubscribe()
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const signIn = async (email: string, pass: string) => {
    setLoading(true)
    try {
      const res = await signInWithEmail(email, pass)
      setUser(res.user)
      window.dispatchEvent(new Event('storage'))
      return { success: true, message: res.message }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.'
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, pass: string, name: string) => {
    setLoading(true)
    try {
      const res = await signUpWithEmail(email, pass, name)
      setUser(res.user)
      window.dispatchEvent(new Event('storage'))
      return { success: true, message: res.message }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.'
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await signOutUser()
      const guest = await getCurrentAuthUser()
      setUser(guest)
      window.dispatchEvent(new Event('storage'))
    } finally {
      setLoading(false)
    }
  }

  const setGuest = () => {
    const guest = continueAsGuest()
    setUser(guest)
    window.dispatchEvent(new Event('storage'))
  }

  const loginDemo = async () => {
    setLoading(true)
    try {
      const demo = loginAsDemoPlayer()
      setUser(demo)
      window.dispatchEvent(new Event('storage'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        setGuest,
        loginDemo,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
