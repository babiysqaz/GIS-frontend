<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import { useLayerStore } from '@/stores/layerStore'
import LayerTable from '@/components/admin/LayerTable.vue'
import LayerTableToolbar from '@/components/admin/LayerTableToolbar.vue'
import { useLayerTableFilters } from '@/composables/useLayerTableFilters'

const layerStore = useLayerStore()
const layerList = toRef(layerStore, 'layers')
const {
  search,
  typeFilter,
  visibleFilter,
  filteredLayers,
  typeOptions,
  visibleOptions,
} = useLayerTableFilters(layerList)
const pageSize = ref(10)
const pageSizeOptions = [
  { label: '每頁 5 筆', value: 5 },
  { label: '每頁 10 筆', value: 10 },
  { label: '每頁 20 筆', value: 20 },
]

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

    <LayerTableToolbar
      class="mb-4 rounded-xl"
      :search="search"
      :typeFilter="typeFilter"
      :visibleFilter="visibleFilter"
      :pageSize="pageSize"
      :typeOptions="typeOptions"
      :visibleOptions="visibleOptions"
      :pageSizeOptions="pageSizeOptions"
      @update:search="search = $event"
      @update:typeFilter="typeFilter = $event"
      @update:visibleFilter="visibleFilter = $event"
      @update:pageSize="pageSize = $event"
    />

    <LayerTable :layers="filteredLayers" :loading="layerStore.loading" :pageSize="pageSize" />
  </div>
</template>
