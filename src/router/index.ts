import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MapPage from '@/pages/MapPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import LayersPage from '@/pages/admin/LayersPage.vue'
import LayerEditPage from '@/pages/admin/LayerEditPage.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [{ path: '', name: 'map', component: MapPage }],
  },
  { path: '/login', name: 'login', component: LoginPage },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'layers', name: 'admin-layers', component: LayersPage },
      { path: 'layers/new', name: 'admin-layer-new', component: LayerEditPage },
      { path: 'layers/:id/edit', name: 'admin-layer-edit', component: LayerEditPage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.role === 'admin' && auth.role !== 'admin') return { name: 'map' }
})

export default router
