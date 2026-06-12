<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as layerService from '@/services/layerService'
import LayerTable from '@/components/admin/LayerTable.vue'
import LayerTableToolbar from '@/components/admin/LayerTableToolbar.vue'
import type { Layer, LayerListParams } from '@/types/layer'
import type { LayerTypeFilter, LayerVisibleFilter } from '@/composables/useLayerTableFilters'

const layers = ref<Layer[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const typeFilter = ref<LayerTypeFilter>('all')
const visibleFilter = ref<LayerVisibleFilter>('all')
const error = ref<string | null>(null)

const typeOptions = [
  { label: '全部類型', value: 'all' },
  { label: 'Feature', value: 'feature' },
  { label: 'Tile', value: 'tile' },
]

const visibleOptions = [
  { label: '全部狀態', value: 'all' },
  { label: '顯示', value: 'visible' },
  { label: '隱藏', value: 'hidden' },
]

const pageSizeOptions = [
  { label: '每頁 5 筆', value: 5 },
  { label: '每頁 10 筆', value: 10 },
  { label: '每頁 20 筆', value: 20 },
]

async function loadPage() {
  loading.value = true
  error.value = null
  try {
    const params: LayerListParams = {
      page: page.value,
      size: pageSize.value,
      search: search.value || undefined,
      layerType: typeFilter.value === 'all' ? null : typeFilter.value,
      visible: visibleFilter.value === 'all' ? null : visibleFilter.value === 'visible',
    }
    const result = await layerService.fetchLayers(params)
    layers.value = result.items
    total.value = result.total
  } catch {
    error.value = '載入圖層失敗'
  } finally {
    loading.value = false
  }
}

watch([search, typeFilter, visibleFilter, pageSize], () => {
  page.value = 1
  loadPage()
})

watch(page, loadPage)

onMounted(loadPage)
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

    <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
      {{ error }}
    </div>

    <LayerTableToolbar
      class="mb-4 rounded-xl"
      :search="search"
      :type-filter="typeFilter"
      :visible-filter="visibleFilter"
      :page-size="pageSize"
      :type-options="typeOptions"
      :visible-options="visibleOptions"
      :page-size-options="pageSizeOptions"
      @update:search="search = $event"
      @update:type-filter="typeFilter = $event"
      @update:visible-filter="visibleFilter = $event"
      @update:page-size="pageSize = $event"
    />

    <LayerTable
      :layers="layers"
      :loading="loading"
      :page-size="pageSize"
      :total="total"
      :page="page"
      @update:page="page = $event"
      @deleted="loadPage"
    />
  </div>
</template>
