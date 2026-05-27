export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}
