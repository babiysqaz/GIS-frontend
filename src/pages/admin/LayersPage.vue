<script setup lang="ts">
import { onMounted } from 'vue'
import { useLayerStore } from '@/stores/layerStore'
import LayerTable from '@/components/admin/LayerTable.vue'

const layerStore = useLayerStore()

onMounted(() => layerStore.loadLayers())
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">圖層管理</h1>
      <RouterLink
        to="/admin/layers/new"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        新增圖層
      </RouterLink>
    </div>

    <div v-if="layerStore.error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
      {{ layerStore.error }}
    </div>

    <LayerTable :layers="layerStore.layers" :loading="layerStore.loading" />
  </div>
</template>
