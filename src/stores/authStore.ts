import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserRole } from '@/types/user'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem('access_token'))
  const refreshTokenValue = ref<string | null>(sessionStorage.getItem('refresh_token'))
  const role = ref<UserRole | null>((sessionStorage.getItem('role') as UserRole) ?? null)

  const isLoggedIn = computed(() => token.value !== null)
  const isAdmin = computed(() => role.value === 'admin')

  function _decodeRole(accessToken: string): UserRole {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      return payload.role ?? 'user'
    } catch {
      return 'user'
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const data = await authService.login(email, password)
    token.value = data.accessToken
    refreshTokenValue.value = data.refreshToken
    role.value = _decodeRole(data.accessToken)
    sessionStorage.setItem('access_token', data.accessToken)
    sessionStorage.setItem('refresh_token', data.refreshToken)
    sessionStorage.setItem('role', role.value)
  }

  async function refresh(): Promise<void> {
    if (!refreshTokenValue.value) return logout()
    const data = await authService.refreshToken(refreshTokenValue.value)
    token.value = data.accessToken
    refreshTokenValue.value = data.refreshToken
    role.value = _decodeRole(data.accessToken)
    sessionStorage.setItem('access_token', data.accessToken)
    sessionStorage.setItem('refresh_token', data.refreshToken)
    sessionStorage.setItem('role', role.value)
  }

  function logout(): void {
    token.value = null
    refreshTokenValue.value = null
    role.value = null
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('role')
  }

  return { token, role, isLoggedIn, isAdmin, login, refresh, logout }
})
