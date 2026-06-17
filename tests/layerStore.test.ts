import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayerStore } from '@/stores/layerStore'
import type { Layer } from '@/types/layer'

vi.mock('@/services/layerService', () => ({
  fetchAllLayers: vi.fn(),
  fetchLayers: vi.fn(),
  createLayer: vi.fn(),
  updateLayer: vi.fn(),
  deleteLayer: vi.fn(),
  batchUpdateSortOrder: vi.fn(),
}))

import * as layerService from '@/services/layerService'

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: 1,
    name: 'Test Layer',
    description: '',
    serviceUrl: 'http://example.com',
    layerType: 'feature',
    visible: true,
    opacity: 1,
    sortOrder: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('layerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('loadLayers', () => {
    it('populates layers on success', async () => {
      const data = [makeLayer({ id: 1 }), makeLayer({ id: 2 })]
      vi.mocked(layerService.fetchAllLayers).mockResolvedValueOnce(data)

      const store = useLayerStore()
      await store.loadLayers()

      expect(store.layers).toEqual(data)
      expect(store.error).toBeNull()
    })

    it('sets error message on failure', async () => {
      vi.mocked(layerService.fetchAllLayers).mockRejectedValueOnce(new Error('Network error'))

      const store = useLayerStore()
      await store.loadLayers()

      expect(store.layers).toEqual([])
      expect(store.error).toBe('載入圖層失敗')
    })

    it('resets loading to false after success', async () => {
      vi.mocked(layerService.fetchAllLayers).mockResolvedValueOnce([])

      const store = useLayerStore()
      await store.loadLayers()

      expect(store.loading).toBe(false)
    })

    it('resets loading to false after failure', async () => {
      vi.mocked(layerService.fetchAllLayers).mockRejectedValueOnce(new Error())

      const store = useLayerStore()
      await store.loadLayers()

      expect(store.loading).toBe(false)
    })

    it('clears previous error before fetching', async () => {
      vi.mocked(layerService.fetchAllLayers)
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce([])

      const store = useLayerStore()
      await store.loadLayers()
      expect(store.error).toBe('載入圖層失敗')

      await store.loadLayers()
      expect(store.error).toBeNull()
    })
  })

  describe('addLayer', () => {
    it('appends the new layer to state and returns it', async () => {
      const newLayer = makeLayer({ id: 10, name: 'New' })
      vi.mocked(layerService.createLayer).mockResolvedValueOnce(newLayer)

      const store = useLayerStore()
      const result = await store.addLayer({
        name: 'New',
        description: '',
        serviceUrl: 'http://x.com',
        visible: true,
        opacity: 1,
        sortOrder: 0,
      })

      expect(result).toEqual(newLayer)
      expect(store.layers).toContainEqual(newLayer)
    })
  })

  describe('editLayer', () => {
    it('updates the layer in the array by id', async () => {
      const original = makeLayer({ id: 5, name: 'Old Name' })
      const updated = makeLayer({ id: 5, name: 'New Name' })
      vi.mocked(layerService.updateLayer).mockResolvedValueOnce(updated)

      const store = useLayerStore()
      store.layers = [original]

      const result = await store.editLayer(5, { name: 'New Name' })

      expect(result).toEqual(updated)
      expect(store.layers[0].name).toBe('New Name')
    })

    it('leaves other layers untouched', async () => {
      const layer1 = makeLayer({ id: 1 })
      const layer2 = makeLayer({ id: 2, name: 'Other' })
      const updated = makeLayer({ id: 1, name: 'Updated' })
      vi.mocked(layerService.updateLayer).mockResolvedValueOnce(updated)

      const store = useLayerStore()
      store.layers = [layer1, layer2]
      await store.editLayer(1, { name: 'Updated' })

      expect(store.layers[1].name).toBe('Other')
    })
  })

  describe('removeLayer', () => {
    it('removes the layer from the array', async () => {
      vi.mocked(layerService.deleteLayer).mockResolvedValueOnce(undefined)

      const store = useLayerStore()
      store.layers = [makeLayer({ id: 3 }), makeLayer({ id: 4 })]
      await store.removeLayer(3)

      expect(store.layers).toHaveLength(1)
      expect(store.layers[0].id).toBe(4)
    })
  })

  describe('setLayerVisible', () => {
    it('sets visible on the matching layer', () => {
      const store = useLayerStore()
      store.layers = [makeLayer({ id: 1, visible: true })]

      store.setLayerVisible(1, false)

      expect(store.layers[0].visible).toBe(false)
    })

    it('does nothing when id is not found', () => {
      const store = useLayerStore()
      store.layers = [makeLayer({ id: 1, visible: true })]

      expect(() => store.setLayerVisible(99, false)).not.toThrow()
      expect(store.layers[0].visible).toBe(true)
    })
  })
})
