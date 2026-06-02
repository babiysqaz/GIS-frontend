<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useLayerStore } from '@/stores/layerStore'
import type { Layer } from '@/types/layer'

const props = defineProps<{
  layers: Layer[]
  loading: boolean
  pageSize: number
}>()

const confirm = useConfirm()
const toast = useToast()
const layerStore = useLayerStore()

const sortField = ref<'name' | 'layerType' | 'sortOrder' | 'visible' | 'opacity'>('sortOrder')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

const sortedLayers = computed(() => {
  const ordered = [...props.layers]

  ordered.sort((a, b) => {
    const dir = sortDirection.value === 'asc' ? 1 : -1

    switch (sortField.value) {
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'layerType':
        return a.layerType.localeCompare(b.layerType) * dir
      case 'sortOrder':
        return (a.sortOrder - b.sortOrder) * dir
      case 'visible':
        return ((a.visible === b.visible ? 0 : a.visible ? -1 : 1) as number) * dir
      case 'opacity':
        return (a.opacity - b.opacity) * dir
      default:
        return 0
    }
  })

  return ordered
})

const pageCount = computed(() => Math.max(1, Math.ceil(sortedLayers.value.length / props.pageSize)))

watch(() => props.pageSize, () => {
  currentPage.value = 1
})

watch(pageCount, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
})

const pagedLayers = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return sortedLayers.value.slice(start, start + props.pageSize)
})

function confirmDelete(layer: Layer) {
  confirm.require({
    message: `確定要刪除「${layer.name}」嗎？`,
    header: '刪除確認',
    acceptLabel: '刪除',
    rejectLabel: '取消',
    accept: async () => {
      try {
        await layerStore.removeLayer(layer.id)
        toast.add({ severity: 'success', summary: '已刪除', life: 2000 })
      } catch {
        toast.add({ severity: 'error', summary: '刪除失敗', life: 3000 })
      }
    },
  })
}

function toggleSort(field: typeof sortField.value) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function setPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), pageCount.value)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-white shadow-sm border">
    <div v-if="loading" class="p-6 text-center text-sm text-gray-500">載入中...</div>
    <div v-else-if="!props.layers.length" class="p-6 text-center text-sm text-gray-500">
      未找到符合條件的圖層。
    </div>

    <table v-else class="w-full text-sm">
      <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
        <tr>
          <th class="cursor-pointer px-4 py-3 text-left" @click="toggleSort('name')">
            名稱
            <span class="inline-block w-4 text-right">
              <span v-if="sortField === 'name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </span>
          </th>
          <th class="cursor-pointer px-4 py-3 text-left" @click="toggleSort('layerType')">
            類型
            <span class="inline-block w-4 text-right">
              <span v-if="sortField === 'layerType'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </span>
          </th>
          <th class="cursor-pointer px-4 py-3 text-left" @click="toggleSort('sortOrder')">
            排序
            <span class="inline-block w-4 text-right">
              <span v-if="sortField === 'sortOrder'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </span>
          </th>
          <th class="cursor-pointer px-4 py-3 text-left" @click="toggleSort('visible')">
            預設顯示
            <span class="inline-block w-4 text-right">
              <span v-if="sortField === 'visible'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </span>
          </th>
          <th class="cursor-pointer px-4 py-3 text-left" @click="toggleSort('opacity')">
            透明度
            <span class="inline-block w-4 text-right">
              <span v-if="sortField === 'opacity'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </span>
          </th>
          <th class="px-4 py-3 text-right">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="layer in pagedLayers" :key="layer.id" class="hover:bg-gray-50">
          <td class="px-4 py-3 font-medium text-gray-800">{{ layer.name }}</td>
          <td class="px-4 py-3 text-gray-500">{{ layer.layerType }}</td>
          <td class="px-4 py-3 text-gray-500">{{ layer.sortOrder }}</td>
          <td class="px-4 py-3">
            <span
              :class="layer.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {{ layer.visible ? '顯示' : '隱藏' }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-500">{{ (layer.opacity * 100).toFixed(0) }}%</td>
          <td class="px-4 py-3 text-right">
            <RouterLink
              :to="`/admin/layers/${layer.id}/edit`"
              class="mr-2 text-blue-600 hover:underline"
            >
              編輯
            </RouterLink>
            <button class="text-red-500 hover:underline" @click="confirmDelete(layer)">
              刪除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-500">
      <div>
        顯示 {{ pagedLayers.length }} / {{ props.layers.length }} 筆
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          上一頁
        </button>
        <button
          class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === pageCount"
          @click="setPage(currentPage + 1)"
        >
          下一頁
        </button>
      </div>
    </div>
  </div>

  <ConfirmDialog />
</template>
