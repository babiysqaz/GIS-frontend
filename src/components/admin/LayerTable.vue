<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useLayerStore } from '@/stores/layerStore'
import type { Layer } from '@/types/layer'

defineProps<{
  layers: Layer[]
  loading: boolean
}>()

const confirm = useConfirm()
const toast = useToast()
const layerStore = useLayerStore()

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
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-white shadow-sm">
    <div v-if="loading" class="p-6 text-center text-sm text-gray-500">載入中...</div>
    <div v-else-if="!layers.length" class="p-6 text-center text-sm text-gray-500">
      尚無圖層，請新增一筆。
    </div>
    <table v-else class="w-full text-sm">
      <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
        <tr>
          <th class="px-4 py-3 text-left">名稱</th>
          <th class="px-4 py-3 text-left">類型</th>
          <th class="px-4 py-3 text-left">排序</th>
          <th class="px-4 py-3 text-left">可見</th>
          <th class="px-4 py-3 text-left">透明度</th>
          <th class="px-4 py-3 text-right">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="layer in layers" :key="layer.id" class="hover:bg-gray-50">
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
  </div>

  <ConfirmDialog />
</template>
