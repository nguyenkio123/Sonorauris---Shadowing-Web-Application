import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types/auth'
import { getUserBase, saveUserBase } from './storage'

const STORAGE_KEYS = {
  AUTH_USER: 'shadowing_auth_user',
  LOCAL_ACCOUNTS: 'shadowing_local_accounts',
} as const

interface StoredLocalAccount {
  id: string
  email: string
  passwordHash: string
  displayName: string
  avatarUrl: string
  createdAt: string
}

function readJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase)
}

/**
 * Returns current authenticated user (Supabase or Local Session)
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  // 1. Try Supabase Session if configured
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && session.user && !error) {
        const u = session.user
        const meta = u.user_metadata || {}
        return {
          id: u.id,
          email: u.email || '',
          displayName: meta.display_name || meta.name || u.email?.split('@')[0] || 'Learner',
          avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
          isGuest: false,
          createdAt: u.created_at,
        }
      }
    } catch (err) {
      console.warn('[Auth] Supabase getSession failed, falling back to local:', err)
    }
  }

  // 2. Check Local Authenticated User
  const localAuth = readJson<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null)
  if (localAuth) {
    return localAuth
  }

  // 3. Fallback to Guest
  return getGuestUser()
}

export function getGuestUser(): AuthUser {
  const base = getUserBase()
  return {
    id: base.id || 'user-demo-player',
    email: 'guest@sonorauris.com',
    displayName: base.displayName || 'Demo Player',
    avatarUrl: base.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    isGuest: true,
  }
}

/**
 * Signs up a new account (Supabase Auth or Local Account Engine)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: AuthUser; message: string }> {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = displayName.trim() || trimmedEmail.split('@')[0]

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please provide a valid email address.')
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  // 1. Supabase Mode
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          display_name: trimmedName,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        displayName: trimmedName,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`,
        isGuest: false,
        createdAt: data.user.created_at,
      }

      // Sync with user base
      const base = getUserBase()
      saveUserBase({
        ...base,
        id: authUser.id,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl,
      })

      writeJson(STORAGE_KEYS.AUTH_USER, authUser)
      return {
        user: authUser,
        message: data.session
          ? 'Account created and signed in successfully!'
          : 'Registration successful! Please check your email to confirm your account.',
      }
    }
  }

  // 2. Local Engine Mode (Sandbox / Offline)
  const localAccounts = readJson<StoredLocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, [])
  const existing = localAccounts.find((a) => a.email === trimmedEmail)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const newId = `user-local-${Date.now()}`
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`
  const newAccount: StoredLocalAccount = {
    id: newId,
    email: trimmedEmail,
    passwordHash: btoa(password), // simple client sandbox encoding
    displayName: trimmedName,
    avatarUrl,
    createdAt: new Date().toISOString(),
  }

  localAccounts.push(newAccount)
  writeJson(STORAGE_KEYS.LOCAL_ACCOUNTS, localAccounts)

  const authUser: AuthUser = {
    id: newId,
    email: trimmedEmail,
    displayName: trimmedName,
    avatarUrl,
    isGuest: false,
    createdAt: newAccount.createdAt,
  }

  writeJson(STORAGE_KEYS.AUTH_USER, authUser)

  // Sync to user base
  const base = getUserBase()
  saveUserBase({
    ...base,
    id: newId,
    displayName: trimmedName,
    avatarUrl,
  })

  return {
    user: authUser,
    message: 'Account created successfully (Sandbox Profile)!',
  }
}

/**
 * Signs in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AuthUser; message: string }> {
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail) throw new Error('Please enter your email address.')
  if (!password) throw new Error('Please enter your password.')

  // 1. Supabase Mode
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      const meta = data.user.user_metadata || {}
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        displayName: meta.display_name || meta.name || trimmedEmail.split('@')[0],
        avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
        isGuest: false,
        createdAt: data.user.created_at,
      }

      writeJson(STORAGE_KEYS.AUTH_USER, authUser)

      const base = getUserBase()
      saveUserBase({
        ...base,
        id: authUser.id,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl,
      })

      return { user: authUser, message: 'Signed in successfully!' }
    }
  }

  // 2. Local Engine Mode
  const localAccounts = readJson<StoredLocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, [])
  const found = localAccounts.find((a) => a.email === trimmedEmail)

  if (!found || found.passwordHash !== btoa(password)) {
    throw new Error('Invalid email or password.')
  }

  const authUser: AuthUser = {
    id: found.id,
    email: found.email,
    displayName: found.displayName,
    avatarUrl: found.avatarUrl,
    isGuest: false,
    createdAt: found.createdAt,
  }

  writeJson(STORAGE_KEYS.AUTH_USER, authUser)

  const base = getUserBase()
  saveUserBase({
    ...base,
    id: found.id,
    displayName: found.displayName,
    avatarUrl: found.avatarUrl,
  })

  return { user: authUser, message: 'Signed in successfully!' }
}

/**
 * Signs out current user and switches back to Guest
 */
export async function signOutUser(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[Auth] Supabase signOut error:', err)
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  }

  // Re-seed or revert to Demo Player
  const base = getUserBase()
  saveUserBase({
    ...base,
    id: 'user-demo-player',
    displayName: 'Demo Player',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  })
}

/**
 * Explicitly sets Guest mode
 */
export function continueAsGuest(): AuthUser {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  }
  const guest = getGuestUser()
  const base = getUserBase()
  saveUserBase({
    ...base,
    id: 'user-demo-player',
    displayName: 'Demo Player',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  })
  return guest
}
