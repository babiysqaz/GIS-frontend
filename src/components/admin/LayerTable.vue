<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useLayerStore } from '@/stores/layerStore'
import { getApiErrorDetail } from '@/services/api'
import type { Layer } from '@/types/layer'

const props = defineProps<{
  layers: Layer[]
  loading: boolean
  pageSize: number
  total: number
  page: number
}>()

const emit = defineEmits<{
  (event: 'update:page', value: number): void
  (event: 'deleted'): void
}>()

const confirm = useConfirm()
const toast = useToast()
const layerStore = useLayerStore()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function confirmDelete(layer: Layer) {
  confirm.require({
    message: `確定要刪除「${layer.name}」嗎？`,
    header: '刪除確認',
    acceptLabel: '刪除',
    acceptProps: { severity: 'danger', style: 'width:60px;height:36px' },
    rejectLabel: '取消',
    rejectProps: { style: 'width:60px;height:36px' },
    accept: async () => {
      try {
        await layerStore.removeLayer(layer.id)
        toast.add({ severity: 'success', summary: '已刪除', life: 2000 })
        emit('deleted')
      } catch (err) {
        const detail = getApiErrorDetail(err)
        toast.add({
          severity: 'error',
          summary: '刪除失敗',
          detail: detail ?? '請稍後再試',
          life: 5000,
        })
      }
    },
  })
}

function setPage(value: number) {
  emit('update:page', Math.min(Math.max(value, 1), pageCount.value))
}
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-white shadow-sm border">
    <div v-if="loading" class="p-6 text-center text-sm text-gray-500">載入中...</div>
    <div v-else-if="!layers.length" class="p-6 text-center text-sm text-gray-500">
      未找到符合條件的圖層。
    </div>

    <table v-else class="w-full text-sm">
      <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
        <tr>
          <th class="px-4 py-3 text-left">名稱</th>
          <th class="px-4 py-3 text-left">類型</th>
          <th class="px-4 py-3 text-left">預設可見性</th>
          <th class="px-4 py-3 text-left">透明度</th>
          <th class="px-4 py-3 text-center">操作</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-100">
        <tr v-for="layer in layers" :key="layer.id" class="hover:bg-gray-50">
          <td class="px-4 py-3 font-medium text-gray-800">{{ layer.name }}</td>
          <td class="px-4 py-3 text-gray-500">
            <span
              class="rounded-full px-2 py-0.5 text-xs"
              :class="
                layer.layerType === 'feature'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              "
            >
              {{ layer.layerType }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span
              :class="layer.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {{ layer.visible ? '顯示' : '隱藏' }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-500">{{ (layer.opacity * 100).toFixed(0) }}%</td>
          <td class="px-4 py-3 text-center">
            <RouterLink
              :to="`/admin/layers/${layer.id}/edit`"
              class="mr-2 inline-flex h-9 w-[60px] items-center justify-center rounded border border-blue-200 text-sm text-blue-600 hover:bg-blue-50"
            >
              編輯
            </RouterLink>
            <button
              class="inline-flex h-9 w-[60px] items-center justify-center rounded border border-red-200 text-sm text-red-500 hover:bg-red-50"
              @click="confirmDelete(layer)"
            >
              刪除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-500">
      <span>共 {{ total }} 筆　第 {{ page }} / {{ pageCount }} 頁</span>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="page === 1"
          @click="setPage(page - 1)"
        >
          上一頁
        </button>
        <button
          class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="page === pageCount"
          @click="setPage(page + 1)"
        >
          下一頁
        </button>
      </div>
    </div>
  </div>

  <ConfirmDialog />
</template>
