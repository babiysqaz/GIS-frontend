<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useToast } from 'primevue/usetoast'
import { fetchAllLayers, batchUpdateSortOrder } from '@/services/layerService'
import type { Layer } from '@/types/layer'

const emit = defineEmits<{
  (event: 'done'): void
}>()

const toast = useToast()
const layers = ref<Layer[]>([])
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const all = await fetchAllLayers()
    layers.value = [...all].sort((a, b) => a.sortOrder - b.sortOrder)
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    const items = layers.value.map((l, index) => ({ id: l.id, sortOrder: index + 1 }))
    await batchUpdateSortOrder(items)
    toast.add({ severity: 'success', summary: '排序已儲存', life: 2000 })
    emit('done')
  } catch {
    toast.add({ severity: 'error', summary: '排序儲存失敗', detail: '請稍後再試', life: 5000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-white shadow-sm border">
    <div class="flex items-center justify-between border-b px-4 py-3">
      <p class="text-sm text-gray-500">拖曳列表以調整圖層疊加順序，序號越小越底層。</p>
      <div class="flex gap-2">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          :disabled="saving"
          @click="emit('done')"
        >
          取消
        </button>
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="saving || loading"
          @click="save"
        >
          {{ saving ? '儲存中...' : '儲存順序' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-6 text-center text-sm text-gray-500">載入中...</div>
    <div v-else-if="!layers.length" class="p-6 text-center text-sm text-gray-500">尚無圖層。</div>

    <VueDraggable
      v-else
      v-model="layers"
      tag="ul"
      handle=".drag-handle"
      :animation="200"
      :disabled="saving"
      class="divide-y divide-gray-100"
    >
      <li
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
      >
        <span
          class="drag-handle cursor-grab select-none text-lg text-gray-400 active:cursor-grabbing"
          :class="{ 'opacity-30': saving }"
        >
          ⠿
        </span>
        <span class="w-6 text-center text-xs tabular-nums text-gray-400">{{ index + 1 }}</span>
        <span class="flex-1 text-sm font-medium text-gray-800">{{ layer.name }}</span>
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
      </li>
    </VueDraggable>
  </div>
</template>
