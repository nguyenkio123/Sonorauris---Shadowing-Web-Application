export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  isGuest: boolean
  createdAt?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isConfigured: boolean
}
