export type UserRole = 'admin' | 'user'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  isGuest: boolean
  role: UserRole
  createdAt?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isConfigured: boolean
}
