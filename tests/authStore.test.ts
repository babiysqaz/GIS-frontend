import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/services/authService', () => ({
  login: vi.fn(),
  refreshToken: vi.fn(),
}))

import * as authService from '@/services/authService'

/** Build a minimal JWT whose payload contains the given object. */
function makeJwt(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
  return `header.${encoded}.sig`
}

describe('authStore', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('isLoggedIn is false when sessionStorage has no token', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('isLoggedIn is true when sessionStorage has a token', () => {
      sessionStorage.setItem('access_token', 'some-token')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(true)
    })

    it('isAdmin is false by default', () => {
      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })

    it('isAdmin is true when sessionStorage has role=admin', () => {
      sessionStorage.setItem('role', 'admin')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.isAdmin).toBe(true)
    })
  })

  describe('login', () => {
    it('stores access and refresh tokens', async () => {
      const accessToken = makeJwt({ role: 'user' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref-token',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass')

      expect(store.token).toBe(accessToken)
      expect(sessionStorage.getItem('access_token')).toBe(accessToken)
      expect(sessionStorage.getItem('refresh_token')).toBe('ref-token')
    })

    it('decodes admin role from JWT payload', async () => {
      const accessToken = makeJwt({ role: 'admin' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('admin@example.com', 'pass')

      expect(store.role).toBe('admin')
      expect(store.isAdmin).toBe(true)
      expect(sessionStorage.getItem('role')).toBe('admin')
    })

    it('decodes user role from JWT payload', async () => {
      const accessToken = makeJwt({ role: 'user' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass')

      expect(store.role).toBe('user')
      expect(store.isAdmin).toBe(false)
    })

    it('falls back to user role when JWT payload has no role', async () => {
      const accessToken = makeJwt({ sub: 'someone' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass')

      expect(store.role).toBe('user')
    })

    it('falls back to user role when JWT is malformed', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken: 'not.a.jwt',
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass')

      expect(store.role).toBe('user')
    })
  })

  describe('logout', () => {
    it('clears token, refreshToken, and role from state', async () => {
      const accessToken = makeJwt({ role: 'admin' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('admin@example.com', 'pass')
      store.logout()

      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdmin).toBe(false)
    })

    it('removes all auth keys from sessionStorage', async () => {
      const accessToken = makeJwt({ role: 'user' })
      vi.mocked(authService.login).mockResolvedValueOnce({
        accessToken,
        refreshToken: 'ref',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.login('user@example.com', 'pass')
      store.logout()

      expect(sessionStorage.getItem('access_token')).toBeNull()
      expect(sessionStorage.getItem('refresh_token')).toBeNull()
      expect(sessionStorage.getItem('role')).toBeNull()
    })
  })

  describe('refresh', () => {
    it('updates tokens on successful refresh', async () => {
      sessionStorage.setItem('refresh_token', 'old-refresh')
      setActivePinia(createPinia())

      const newAccessToken = makeJwt({ role: 'user' })
      vi.mocked(authService.refreshToken).mockResolvedValueOnce({
        accessToken: newAccessToken,
        refreshToken: 'new-refresh',
        tokenType: 'bearer',
      })

      const store = useAuthStore()
      await store.refresh()

      expect(store.token).toBe(newAccessToken)
      expect(sessionStorage.getItem('refresh_token')).toBe('new-refresh')
    })

    it('clears auth state when no refresh token is available', async () => {
      sessionStorage.setItem('access_token', 'existing-token')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(true)

      await store.refresh()

      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(authService.refreshToken).not.toHaveBeenCalled()
    })
  })
})
