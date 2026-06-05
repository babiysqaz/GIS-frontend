import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { notifyError } from '@/services/notify'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

type PendingResolver = (token: string) => void
type PendingRejector = (err: unknown) => void

let isRefreshing = false
let pendingQueue: Array<{ resolve: PendingResolver; reject: PendingRejector }> = []

function drainQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err) {
      reject(err)
    } else if (token !== null) {
      resolve(token)
    }
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as typeof err.config & { _retry?: boolean }

    // 非 401、或是 refresh 端點本身失敗 → 顯示對應提示後拒絕，避免無限迴圈
    if (err.response?.status !== 401 || originalRequest._retry) {
      const status = err.response?.status
      if (!err.response) {
        notifyError('無法連線至伺服器，請稍後再試')
      } else if (status !== undefined && status >= 500) {
        notifyError('伺服器發生錯誤，請稍後再試')
      } else if (status === 403) {
        notifyError('您沒有權限執行此操作')
      }
      return Promise.reject(err)
    }

    // 若已在 refresh 中，把請求排進佇列等待新 token
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const auth = useAuthStore()
    try {
      await auth.refresh()
      const newToken = auth.token
      if (!newToken) throw new Error('Token missing after refresh')
      drainQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshErr) {
      drainQueue(refreshErr, null)
      auth.logout()
      router.push('/login')
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

export default api

export function getApiErrorDetail(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string' && detail) return detail
  }
  return null
}
