import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Layer, LayerFormData } from '@/types/layer'
import * as layerService from '@/services/layerService'

export const useLayerStore = defineStore('layer', () => {
  const layers = ref<Layer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadLayers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      layers.value = await layerService.fetchLayers()
    } catch {
      error.value = '載入圖層失敗'
    } finally {
      loading.value = false
    }
  }

  async function addLayer(data: LayerFormData): Promise<Layer> {
    const layer = await layerService.createLayer(data)
    layers.value.push(layer)
    return layer
  }

  async function editLayer(id: number, data: Partial<LayerFormData>): Promise<Layer> {
    const updated = await layerService.updateLayer(id, data)
    const idx = layers.value.findIndex((l) => l.id === id)
    if (idx !== -1) layers.value[idx] = updated
    return updated
  }

  async function removeLayer(id: number): Promise<void> {
    await layerService.deleteLayer(id)
    layers.value = layers.value.filter((l) => l.id !== id)
  }

  function setLayerVisible(id: number, visible: boolean): void {
    const layer = layers.value.find((l) => l.id === id)
    if (layer) layer.visible = visible
  }

  return { layers, loading, error, loadLayers, addLayer, editLayer, removeLayer, setLayerVisible }
})
