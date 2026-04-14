import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  async function login(email: string, password: string): Promise<void> {
    await authStore.login(email, password)
    const redirect = authStore.isAdmin ? '/admin/layers' : '/'
    await router.push(redirect)
  }

  function logout(): void {
    authStore.logout()
    router.push('/login')
  }

  return { authStore, login, logout }
}
