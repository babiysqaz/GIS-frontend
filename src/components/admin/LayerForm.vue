<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LayerFormData } from '@/types/layer'

const props = defineProps<{
  initialData?: LayerFormData
}>()

const emit = defineEmits<{
  submit: [data: LayerFormData]
}>()

const defaultForm = (): LayerFormData => ({
  name: '',
  description: '',
  serviceUrl: '',
  layerType: 'feature',
  visible: true,
  opacity: 1.0,
  sortOrder: 0,
})

const form = ref<LayerFormData>(defaultForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) form.value = { ...data }
  },
  { immediate: true },
)

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">名稱 *</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">描述</label>
      <textarea
        v-model="form.description"
        rows="2"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">Service URL *</label>
      <input
        v-model="form.serviceUrl"
        type="url"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        placeholder="https://services.arcgis.com/..."
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">圖層類型</label>
      <select
        v-model="form.layerType"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="feature">Feature Layer</option>
        <option value="tile">Tile Layer</option>
      </select>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700">排序</label>
        <input
          v-model.number="form.sortOrder"
          type="number"
          min="0"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          透明度 ({{ (form.opacity * 100).toFixed(0) }}%)
        </label>
        <input
          v-model.number="form.opacity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          class="w-full"
        />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input id="visible" v-model="form.visible" type="checkbox" />
      <label for="visible" class="text-sm font-medium text-gray-700">預設顯示</label>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <RouterLink
        to="/admin/layers"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        取消
      </RouterLink>
      <button
        type="submit"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        儲存
      </button>
    </div>
  </form>
</template>
