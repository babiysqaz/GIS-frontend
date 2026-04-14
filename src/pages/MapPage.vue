<script setup lang="ts">
import { onMounted, watch } from 'vue'
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
  <div class="relative h-full w-full">
    <MapViewer />
    <LayerToggle class="absolute left-4 top-4 z-10" />
    <LayerLegend class="absolute bottom-4 right-4 z-10" />

    <RouterLink
      v-if="authStore.isAdmin"
      to="/admin/layers"
      class="absolute right-4 top-4 z-10 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
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
  </div>
</template>
