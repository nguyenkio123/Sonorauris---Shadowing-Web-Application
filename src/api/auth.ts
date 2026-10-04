import { supabase } from '../lib/supabase'
import type { AuthUser, UserRole } from '../types/auth'
import { getUserBase, saveUserBase } from './storage'

const STORAGE_KEYS = {
  AUTH_USER: 'shadowing_auth_user',
  LOCAL_ACCOUNTS: 'shadowing_local_accounts',
} as const

export interface StoredLocalAccount {
  id: string
  email: string
  passwordHash: string
  displayName: string
  avatarUrl: string
  role: UserRole
  createdAt: string
}

export const DEFAULT_ADMIN_ACCOUNT: StoredLocalAccount = {
  id: 'user-admin-default',
  email: 'admin@sonorauris.com',
  passwordHash: btoa('admin123'),
  displayName: 'System Admin',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminSonorauris',
  role: 'admin',
  createdAt: '2026-09-01T00:00:00.000Z',
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

export function getLocalAccounts(): StoredLocalAccount[] {
  const accounts = readJson<StoredLocalAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, [])
  if (!accounts.some((a) => a.email === DEFAULT_ADMIN_ACCOUNT.email)) {
    accounts.unshift(DEFAULT_ADMIN_ACCOUNT)
    writeJson(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts)
  }
  return accounts
}

export function saveLocalAccounts(accounts: StoredLocalAccount[]): void {
  writeJson(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts)
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
        const role: UserRole = meta.role === 'admin' ? 'admin' : 'user'
        return {
          id: u.id,
          email: u.email || '',
          displayName: meta.display_name || meta.name || u.email?.split('@')[0] || 'Learner',
          avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
          role,
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
    return {
      ...localAuth,
      role: localAuth.role || 'user',
    }
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
    role: (base as { role?: UserRole }).role || 'user',
    isGuest: true,
  }
}

/**
 * Signs up a new account (Supabase Auth or Local Account Engine)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'user'
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
          role,
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
        role,
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
        role,
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
  const localAccounts = getLocalAccounts()
  const existing = localAccounts.find((a) => a.email === trimmedEmail)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const newId = `user-local-${Date.now()}`
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`
  const newAccount: StoredLocalAccount = {
    id: newId,
    email: trimmedEmail,
    passwordHash: btoa(password),
    displayName: trimmedName,
    avatarUrl,
    role,
    createdAt: new Date().toISOString(),
  }

  localAccounts.push(newAccount)
  saveLocalAccounts(localAccounts)

  const authUser: AuthUser = {
    id: newId,
    email: trimmedEmail,
    displayName: trimmedName,
    avatarUrl,
    role,
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
    role,
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (!error && data?.user) {
        const meta = data.user.user_metadata || {}
        const role: UserRole = meta.role === 'admin' ? 'admin' : 'user'
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          displayName: meta.display_name || meta.name || trimmedEmail.split('@')[0],
          avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
          role,
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
          role,
        })

        return { user: authUser, message: 'Signed in successfully!' }
      }
    } catch (err) {
      console.warn('[Auth] Supabase signIn failed, checking local accounts:', err)
    }
  }

  // 2. Local Engine Mode
  const localAccounts = getLocalAccounts()
  const found = localAccounts.find((a) => a.email === trimmedEmail)

  if (!found || found.passwordHash !== btoa(password)) {
    throw new Error('Invalid email or password.')
  }

  const authUser: AuthUser = {
    id: found.id,
    email: found.email,
    displayName: found.displayName,
    avatarUrl: found.avatarUrl,
    role: found.role || 'user',
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
    role: found.role || 'user',
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
    role: 'user',
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
    role: 'user',
  })
  return guest
}

/**
 * Toggles the role of the currently logged-in user or active session (useful for Demo/Sandbox testing)
 */
export async function toggleCurrentRole(): Promise<UserRole> {
  const current = await getCurrentAuthUser()
  const newRole: UserRole = current?.role === 'admin' ? 'user' : 'admin'

  if (current) {
    const updated: AuthUser = {
      ...current,
      role: newRole,
    }
    writeJson(STORAGE_KEYS.AUTH_USER, updated)

    const base = getUserBase()
    saveUserBase({
      ...base,
      role: newRole,
    })

    // Also update in localAccounts if present
    const accounts = getLocalAccounts()
    const idx = accounts.findIndex((a) => a.id === current.id)
    if (idx >= 0) {
      accounts[idx].role = newRole
      saveLocalAccounts(accounts)
    }
  }

  return newRole
}
