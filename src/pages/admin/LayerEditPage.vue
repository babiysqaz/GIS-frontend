<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useLayerStore } from '@/stores/layerStore'
import LayerForm from '@/components/admin/LayerForm.vue'
import { getApiErrorDetail } from '@/services/api'
import type { LayerFormData } from '@/types/layer'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const layerStore = useLayerStore()

const layerId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => layerId.value !== null)

const initialData = ref<LayerFormData | undefined>(undefined)

onMounted(async () => {
  if (isEdit.value) {
    if (!layerStore.layers.length) await layerStore.loadLayers()
    const layer = layerStore.layers.find((l) => l.id === layerId.value)
    if (layer) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = layer
      initialData.value = rest
    }
  }
})

async function handleSubmit(data: LayerFormData) {
  try {
    if (isEdit.value && layerId.value) {
      await layerStore.editLayer(layerId.value, data)
      toast.add({ severity: 'success', summary: '已更新', life: 2000 })
    } else {
      await layerStore.addLayer(data)
      toast.add({ severity: 'success', summary: '已新增', life: 2000 })
    }
    await router.push('/admin/layers')
  } catch (err) {
    const detail = getApiErrorDetail(err)
    toast.add({
      severity: 'error',
      summary: '操作失敗',
      detail: detail ?? '請稍後再試',
      life: 5000,
    })
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex items-center gap-2">
      <RouterLink to="/admin/layers" class="text-sm text-blue-600 hover:underline">
        ← 圖層列表
      </RouterLink>
      <span class="text-gray-400">/</span>
      <h1 class="text-xl font-bold text-gray-800">{{ isEdit ? '編輯圖層' : '新增圖層' }}</h1>
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <LayerForm :initial-data="initialData" @submit="handleSubmit" />
    </div>
  </div>
</template>
