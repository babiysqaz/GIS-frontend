<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LayerFormData } from '@/types/layer'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Slider from 'primevue/slider'

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
  visible: false,
  opacity: 1.0,
  sortOrder: 0,
})

const form = ref<LayerFormData>(defaultForm())

const inferredLayerType = computed(() =>
  /\/FeatureServer/i.test(form.value.serviceUrl) ? 'Feature Layer' : 'Tile Layer',
)

watch(
  () => props.initialData,
  (data) => {
    if (data) form.value = { ...data }
  },
  { immediate: true },
)

const urlError = ref('')

function validateUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function onUrlBlur() {
  urlError.value =
    form.value.serviceUrl && !validateUrl(form.value.serviceUrl)
      ? '請輸入有效的 URL（需以 http:// 或 https:// 開頭）'
      : ''
}

function handleSubmit() {
  if (!validateUrl(form.value.serviceUrl)) {
    urlError.value = '請輸入有效的 URL（需以 http:// 或 https:// 開頭）'
    return
  }
  emit('submit', { ...form.value })
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">名稱 *</label>
      <InputText
        v-model="form.name"
        required
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">描述</label>
      <Textarea
        v-model="form.description"
        rows="2"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">Service URL *</label>
      <InputText
        v-model="form.serviceUrl"
        required
        class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
        :class="
          urlError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
        "
        placeholder="https://services.arcgis.com/..."
        @blur="onUrlBlur"
      />
      <p v-if="urlError" class="mt-1 text-xs text-red-500">{{ urlError }}</p>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700">圖層類型</label>
      <div
        class="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500"
      >
        {{ inferredLayerType }}
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700">疊加排序 *</label>
        <InputNumber v-model="form.sortOrder" required :min="0" class="w-full" />
      </div>
      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          透明度 ({{ (form.opacity * 100).toFixed(0) }}%)
        </label>
        <div class="flex h-9 items-center pr-2">
          <Slider v-model="form.opacity" :min="0" :max="1" :step="0.05" class="w-full" />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Checkbox v-model="form.visible" input-id="visible" binary />
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
