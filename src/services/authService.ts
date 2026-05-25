import api from './api'
import type { TokenResponse } from '@/types/user'

export const login = (email: string, password: string): Promise<TokenResponse> =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const refreshToken = (refreshToken: string): Promise<TokenResponse> =>
  api.post('/auth/refresh', { refreshToken }).then((r) => r.data)
