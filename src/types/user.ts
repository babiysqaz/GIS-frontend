export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}
