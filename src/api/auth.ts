import { supabase } from '../lib/supabase'
import type { AuthUser, UserRole } from '../types/auth'
import { getUserBase, readJson, saveUserBase, writeJson } from './storage'

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
  streak?: number
  lastPracticeDate?: string | null
  lastStreakRestoreDate?: string | null
  brokenStreak?: number
}

export const DEFAULT_ADMIN_ACCOUNT: StoredLocalAccount = {
  id: 'a0000000-0000-0000-0000-000000000001',
  email: 'admin@sonorauris.com',
  passwordHash: btoa('admin123'),
  displayName: 'System Admin',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminSonorauris',
  role: 'admin',
  createdAt: '2026-09-01T00:00:00.000Z',
  streak: 3,
  lastPracticeDate: null,
  lastStreakRestoreDate: null,
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

function persistSession(authUser: AuthUser, rawPassword?: string): AuthUser {
  if (rawPassword) {
    const localAccounts = getLocalAccounts()
    const existingIdx = localAccounts.findIndex((a) => a.email === authUser.email)
    const cachedAcc: StoredLocalAccount = {
      id: authUser.id,
      email: authUser.email,
      passwordHash: btoa(rawPassword),
      displayName: authUser.displayName,
      avatarUrl: authUser.avatarUrl,
      role: authUser.role,
      createdAt: authUser.createdAt || new Date().toISOString(),
    }
    if (existingIdx >= 0) localAccounts[existingIdx] = cachedAcc
    else localAccounts.push(cachedAcc)
    saveLocalAccounts(localAccounts)
  }

  writeJson(STORAGE_KEYS.AUTH_USER, authUser)
  const base = getUserBase()
  saveUserBase({
    ...base,
    id: authUser.id,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    role: authUser.role,
  })
  return authUser
}

function accountToAuthUser(acc: StoredLocalAccount): AuthUser {
  return {
    id: acc.id,
    email: acc.email,
    displayName: acc.displayName,
    avatarUrl: acc.avatarUrl,
    role: acc.role || 'user',
    isGuest: false,
    createdAt: acc.createdAt,
  }
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && session.user && !error) {
        const u = session.user
        const meta = u.user_metadata || {}
        let role: UserRole = meta.role === 'admin' ? 'admin' : 'user'

        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role, display_name, avatar_url')
            .eq('id', u.id)
            .maybeSingle()
          if (dbUser?.role) role = dbUser.role as UserRole
        } catch {
          // ignore
        }

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

  const localAuth = readJson<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null)
  if (localAuth) {
    return { ...localAuth, role: localAuth.role || 'user' }
  }

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

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { display_name: trimmedName, avatar_url: avatarUrl, role } },
    })

    if (error) throw new Error(error.message)

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        displayName: trimmedName,
        avatarUrl,
        role,
        isGuest: false,
        createdAt: data.user.created_at,
      }

      try {
        await supabase.from('users').upsert(
          {
            id: data.user.id,
            email: authUser.email,
            display_name: trimmedName,
            avatar_url: avatarUrl,
            role,
          },
          { onConflict: 'id' }
        )
      } catch (dbErr) {
        console.warn('[Auth] Optional public.users sync error:', dbErr)
      }

      persistSession(authUser, password)
      return {
        user: authUser,
        message: data.session
          ? 'Đăng ký và đăng nhập thành công!'
          : 'Đăng ký thành công! Vui lòng kiểm tra email để bấm link xác thực (hoặc tắt "Confirm email" trong Supabase Dashboard) trước khi đăng nhập.',
      }
    }
  }

  if (getLocalAccounts().some((a) => a.email === trimmedEmail)) {
    throw new Error('An account with this email already exists.')
  }

  const authUser = persistSession(
    {
      id: `user-local-${Date.now()}`,
      email: trimmedEmail,
      displayName: trimmedName,
      avatarUrl,
      role,
      isGuest: false,
      createdAt: new Date().toISOString(),
    },
    password
  )

  return { user: authUser, message: 'Account created successfully (Sandbox Profile)!' }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AuthUser; message: string }> {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) throw new Error('Please enter your email address.')
  if (!password) throw new Error('Please enter your password.')

  if (supabase) {
    let supabaseError: { message: string; status?: number } | null = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error) {
        supabaseError = error
      } else if (data?.user) {
        const meta = data.user.user_metadata || {}
        let role: UserRole = meta.role === 'admin' ? 'admin' : 'user'

        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle()
          if (dbUser?.role) role = dbUser.role as UserRole
        } catch {
          // ignore
        }

        const authUser = persistSession(
          {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            displayName: meta.display_name || meta.name || trimmedEmail.split('@')[0],
            avatarUrl: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
            role,
            isGuest: false,
            createdAt: data.user.created_at,
          },
          password
        )
        return { user: authUser, message: 'Signed in successfully!' }
      }
    } catch (err) {
      if (err instanceof Error) supabaseError = { message: err.message }
    }

    if (supabaseError) {
      const msgLower = supabaseError.message.toLowerCase()
      const found = getLocalAccounts().find((a) => a.email === trimmedEmail && a.passwordHash === btoa(password))

      if (found) {
        const authUser = persistSession(accountToAuthUser(found))
        return {
          user: authUser,
          message:
            msgLower.includes('not confirmed') || msgLower.includes('email not confirmed')
              ? 'Đăng nhập thành công! (Lưu ý: Email trên Supabase chưa xác thực, phiên hiện tại dùng bộ nhớ cục bộ)'
              : 'Signed in successfully!',
        }
      }

      if (msgLower.includes('not confirmed') || msgLower.includes('email not confirmed')) {
        throw new Error(
          `Tài khoản "${trimmedEmail}" chưa được xác thực email trên Supabase (Email not confirmed). Vui lòng kiểm tra hộp thư (hoặc thư rác) để bấm link kích hoạt, hoặc vào Supabase Dashboard > Authentication > Providers > Email để tắt tính năng "Confirm email".`
        )
      }

      throw new Error(
        supabaseError.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không chính xác.'
          : supabaseError.message
      )
    }
  }

  const found = getLocalAccounts().find((a) => a.email === trimmedEmail && a.passwordHash === btoa(password))
  if (!found) throw new Error('Invalid email or password.')

  return { user: persistSession(accountToAuthUser(found)), message: 'Signed in successfully!' }
}

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

  const base = getUserBase()
  saveUserBase({
    ...base,
    id: 'user-demo-player',
    displayName: 'Demo Player',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    role: 'user',
  })
}

export async function toggleCurrentRole(): Promise<UserRole> {
  const current = await getCurrentAuthUser()
  const newRole: UserRole = current?.role === 'admin' ? 'user' : 'admin'

  if (current) {
    persistSession({ ...current, role: newRole })
    const accounts = getLocalAccounts()
    const idx = accounts.findIndex((a) => a.id === current.id)
    if (idx >= 0) {
      accounts[idx].role = newRole
      saveLocalAccounts(accounts)
    }
  }

  return newRole
}
