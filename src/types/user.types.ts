export interface User {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  email?: string
  plan: 'free' | 'pro'
  analysisCount: number
  isDemo?: boolean
  expiresAt?: string
}
