<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="flex w-56 flex-col bg-gray-900 text-white">
      <div class="px-6 py-5 text-lg font-bold tracking-wide">GIS 管理後台</div>
      <nav class="flex-1 px-4">
        <RouterLink
          to="/admin/layers"
          class="mb-1 flex items-center rounded px-3 py-2 text-sm hover:bg-gray-700"
          active-class="bg-gray-700"
        >
          圖層管理
        </RouterLink>
        <RouterLink
          to="/"
          class="mb-1 flex items-center rounded px-3 py-2 text-sm hover:bg-gray-700"
        >
          前台地圖
        </RouterLink>
      </nav>
      <div class="px-4 py-4">
        <button
          class="w-full rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
          @click="logout"
        >
          登出
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex flex-1 flex-col overflow-auto bg-gray-50">
      <RouterView />
    </main>
  </div>
</template>
