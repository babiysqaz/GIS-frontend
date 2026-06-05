import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { Layer } from '@/types/layer'

export type LayerTypeFilter = 'all' | 'feature' | 'tile'
export type LayerVisibleFilter = 'all' | 'visible' | 'hidden'

export function useLayerTableFilters(layers: Ref<Layer[]>) {
  const search = ref('')
  const typeFilter = ref<LayerTypeFilter>('all')
  const visibleFilter = ref<LayerVisibleFilter>('all')

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

  const filteredLayers = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return layers.value.filter((layer) => {
      const matchesKeyword =
        !keyword ||
        layer.name.toLowerCase().includes(keyword) ||
        layer.description.toLowerCase().includes(keyword)

      const matchesType = typeFilter.value === 'all' || layer.layerType === typeFilter.value

      const matchesVisible =
        visibleFilter.value === 'all' ||
        (visibleFilter.value === 'visible' ? layer.visible : !layer.visible)

      return matchesKeyword && matchesType && matchesVisible
    })
  })

  return {
    search,
    typeFilter,
    visibleFilter,
    filteredLayers,
    typeOptions,
    visibleOptions,
  }
}
