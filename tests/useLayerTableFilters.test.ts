import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useLayerTableFilters } from '@/composables/useLayerTableFilters'
import type { Layer } from '@/types/layer'

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: 1,
    name: 'Test Layer',
    description: 'A test description',
    serviceUrl: 'http://example.com/service',
    layerType: 'feature',
    visible: true,
    opacity: 1,
    sortOrder: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useLayerTableFilters', () => {
  describe('filteredLayers — no filters', () => {
    it('returns all layers when all filters are at default', () => {
      const layers = ref([makeLayer({ id: 1 }), makeLayer({ id: 2 })])
      const { filteredLayers } = useLayerTableFilters(layers)
      expect(filteredLayers.value).toHaveLength(2)
    })

    it('returns empty array when layers is empty', () => {
      const layers = ref<Layer[]>([])
      const { filteredLayers } = useLayerTableFilters(layers)
      expect(filteredLayers.value).toHaveLength(0)
    })
  })

  describe('search keyword', () => {
    it('filters by layer name (case-insensitive)', () => {
      const layers = ref([makeLayer({ name: 'Water Layer' }), makeLayer({ name: 'Road Network' })])
      const { search, filteredLayers } = useLayerTableFilters(layers)
      search.value = 'water'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].name).toBe('Water Layer')
    })

    it('filters by description', () => {
      const layers = ref([
        makeLayer({ description: 'shows rainfall data' }),
        makeLayer({ description: 'road infrastructure' }),
      ])
      const { search, filteredLayers } = useLayerTableFilters(layers)
      search.value = 'rainfall'
      expect(filteredLayers.value).toHaveLength(1)
    })

    it('ignores leading and trailing whitespace', () => {
      const layers = ref([makeLayer({ name: 'Water Layer' }), makeLayer({ name: 'Road' })])
      const { search, filteredLayers } = useLayerTableFilters(layers)
      search.value = '  water  '
      expect(filteredLayers.value).toHaveLength(1)
    })

    it('returns all layers when search is empty string', () => {
      const layers = ref([makeLayer({ id: 1 }), makeLayer({ id: 2 })])
      const { search, filteredLayers } = useLayerTableFilters(layers)
      search.value = ''
      expect(filteredLayers.value).toHaveLength(2)
    })
  })

  describe('typeFilter', () => {
    it("filters to only 'feature' layers", () => {
      const layers = ref([
        makeLayer({ id: 1, layerType: 'feature' }),
        makeLayer({ id: 2, layerType: 'tile' }),
      ])
      const { typeFilter, filteredLayers } = useLayerTableFilters(layers)
      typeFilter.value = 'feature'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].layerType).toBe('feature')
    })

    it("filters to only 'tile' layers", () => {
      const layers = ref([
        makeLayer({ id: 1, layerType: 'feature' }),
        makeLayer({ id: 2, layerType: 'tile' }),
      ])
      const { typeFilter, filteredLayers } = useLayerTableFilters(layers)
      typeFilter.value = 'tile'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].layerType).toBe('tile')
    })

    it("'all' returns all layer types", () => {
      const layers = ref([
        makeLayer({ id: 1, layerType: 'feature' }),
        makeLayer({ id: 2, layerType: 'tile' }),
      ])
      const { typeFilter, filteredLayers } = useLayerTableFilters(layers)
      typeFilter.value = 'all'
      expect(filteredLayers.value).toHaveLength(2)
    })
  })

  describe('visibleFilter', () => {
    it("'visible' returns only visible layers", () => {
      const layers = ref([makeLayer({ visible: true }), makeLayer({ visible: false })])
      const { visibleFilter, filteredLayers } = useLayerTableFilters(layers)
      visibleFilter.value = 'visible'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].visible).toBe(true)
    })

    it("'hidden' returns only hidden layers", () => {
      const layers = ref([makeLayer({ visible: true }), makeLayer({ visible: false })])
      const { visibleFilter, filteredLayers } = useLayerTableFilters(layers)
      visibleFilter.value = 'hidden'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].visible).toBe(false)
    })

    it("'all' returns all visibility states", () => {
      const layers = ref([makeLayer({ visible: true }), makeLayer({ visible: false })])
      const { visibleFilter, filteredLayers } = useLayerTableFilters(layers)
      visibleFilter.value = 'all'
      expect(filteredLayers.value).toHaveLength(2)
    })
  })

  describe('combined filters', () => {
    it('applies keyword + type simultaneously', () => {
      const layers = ref([
        makeLayer({ id: 1, name: 'Water Feature', layerType: 'feature' }),
        makeLayer({ id: 2, name: 'Water Tile', layerType: 'tile' }),
        makeLayer({ id: 3, name: 'Road Feature', layerType: 'feature' }),
      ])
      const { search, typeFilter, filteredLayers } = useLayerTableFilters(layers)
      search.value = 'water'
      typeFilter.value = 'feature'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].id).toBe(1)
    })

    it('applies keyword + visible simultaneously', () => {
      const layers = ref([
        makeLayer({ id: 1, name: 'Water', visible: true }),
        makeLayer({ id: 2, name: 'Water', visible: false }),
        makeLayer({ id: 3, name: 'Road', visible: true }),
      ])
      const { search, visibleFilter, filteredLayers } = useLayerTableFilters(layers)
      search.value = 'water'
      visibleFilter.value = 'visible'
      expect(filteredLayers.value).toHaveLength(1)
      expect(filteredLayers.value[0].id).toBe(1)
    })
  })

  describe('exposed options', () => {
    it('typeOptions includes all, feature, tile', () => {
      const { typeOptions } = useLayerTableFilters(ref([]))
      const values = typeOptions.map((o) => o.value)
      expect(values).toContain('all')
      expect(values).toContain('feature')
      expect(values).toContain('tile')
    })

    it('visibleOptions includes all, visible, hidden', () => {
      const { visibleOptions } = useLayerTableFilters(ref([]))
      const values = visibleOptions.map((o) => o.value)
      expect(values).toContain('all')
      expect(values).toContain('visible')
      expect(values).toContain('hidden')
    })
  })
})
