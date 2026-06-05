<script setup lang="ts">
import { onMounted } from 'vue'
import MapViewer from '@/components/map/MapViewer.vue'
import LayerToggle from '@/components/map/LayerToggle.vue'
import LayerLegend from '@/components/map/LayerLegend.vue'
import { useLayerStore } from '@/stores/layerStore'
import { useAuthStore } from '@/stores/authStore'

const layerStore = useLayerStore()
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await layerStore.loadLayers()
  }
})
</script>

<template>
  <div class="flex h-full w-full overflow-hidden">
    <aside class="flex h-full w-80 min-w-[280px] flex-col border-r border-slate-200 bg-slate-50/95 p-4 shadow-sm">
      <div class="mb-6 space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">圖層控制</h2>
        <p class="text-sm text-slate-600">搜尋並切換左側圖層顯示，方便快速定位需要的資料。</p>
      </div>

      <LayerToggle class="min-h-0 flex-1" />
    </aside>

    <main class="relative flex-1 h-full bg-slate-100">
      <MapViewer />
      <LayerLegend class="absolute bottom-5 right-4 z-10" />

      <RouterLink
        v-if="authStore.isAdmin"
        to="/admin/layers"
        class="absolute right-4 top-4 z-10 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        管理後台
      </RouterLink>
      <RouterLink
        v-else-if="!authStore.isLoggedIn"
        to="/login"
        class="absolute right-4 top-4 z-10 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        登入
      </RouterLink>
    </main>
  </div>
</template>
