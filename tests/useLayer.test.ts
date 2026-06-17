import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowRef } from 'vue'
import type { Layer } from '@/types/layer'

vi.mock('@arcgis/core/layers/FeatureLayer', () => ({
  default: vi.fn().mockImplementation((opts: Record<string, unknown>) => ({
    ...opts,
    __type: 'FeatureLayer',
  })),
}))

vi.mock('@arcgis/core/layers/TileLayer', () => ({
  default: vi.fn().mockImplementation((opts: Record<string, unknown>) => ({
    ...opts,
    __type: 'TileLayer',
  })),
}))

import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
import { useLayer } from '@/composables/useLayer'

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: 1,
    name: 'Test',
    description: '',
    serviceUrl: 'http://example.com/service',
    layerType: 'feature',
    visible: true,
    opacity: 0.8,
    sortOrder: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('syncLayers', () => {
    it('does nothing when mapView is null', () => {
      const mapView = shallowRef(null)
      const { syncLayers } = useLayer(mapView as never)
      expect(() => syncLayers([makeLayer()])).not.toThrow()
    })

    it('calls removeAll then adds layers in sortOrder', () => {
      const mockMap = { removeAll: vi.fn(), add: vi.fn(), findLayerById: vi.fn() }
      const mapView = shallowRef({ map: mockMap } as never)
      const { syncLayers } = useLayer(mapView)

      const layers = [
        makeLayer({ id: 2, sortOrder: 2 }),
        makeLayer({ id: 1, sortOrder: 1 }),
        makeLayer({ id: 3, sortOrder: 3 }),
      ]
      syncLayers(layers)

      expect(mockMap.removeAll).toHaveBeenCalledOnce()
      expect(mockMap.add).toHaveBeenCalledTimes(3)

      // verify the order of add calls matches sortOrder ascending
      const addedIds = mockMap.add.mock.calls.map((call) => (call[0] as { id: string }).id)
      expect(addedIds).toEqual(['1', '2', '3'])
    })

    it('creates FeatureLayer for feature layerType', () => {
      const mockMap = { removeAll: vi.fn(), add: vi.fn(), findLayerById: vi.fn() }
      const mapView = shallowRef({ map: mockMap } as never)
      const { syncLayers } = useLayer(mapView)

      syncLayers([makeLayer({ id: 5, layerType: 'feature', serviceUrl: 'http://feat.com' })])

      expect(FeatureLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: '5', url: 'http://feat.com' }),
      )
      expect(TileLayer).not.toHaveBeenCalled()
    })

    it('creates TileLayer for tile layerType', () => {
      const mockMap = { removeAll: vi.fn(), add: vi.fn(), findLayerById: vi.fn() }
      const mapView = shallowRef({ map: mockMap } as never)
      const { syncLayers } = useLayer(mapView)

      syncLayers([makeLayer({ id: 7, layerType: 'tile', serviceUrl: 'http://tile.com' })])

      expect(TileLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: '7', url: 'http://tile.com' }),
      )
      expect(FeatureLayer).not.toHaveBeenCalled()
    })

    it('passes opacity and visible to the layer constructor', () => {
      const mockMap = { removeAll: vi.fn(), add: vi.fn(), findLayerById: vi.fn() }
      const mapView = shallowRef({ map: mockMap } as never)
      const { syncLayers } = useLayer(mapView)

      syncLayers([makeLayer({ id: 3, opacity: 0.5, visible: false })])

      expect(FeatureLayer).toHaveBeenCalledWith(
        expect.objectContaining({ opacity: 0.5, visible: false }),
      )
    })
  })

  describe('toggleLayer', () => {
    it('sets visible on the found layer', () => {
      const mockLayer = { visible: true }
      const mockMap = {
        removeAll: vi.fn(),
        add: vi.fn(),
        findLayerById: vi.fn().mockReturnValue(mockLayer),
      }
      const mapView = shallowRef({ map: mockMap } as never)
      const { toggleLayer } = useLayer(mapView)

      toggleLayer(42, false)

      expect(mockMap.findLayerById).toHaveBeenCalledWith('42')
      expect(mockLayer.visible).toBe(false)
    })

    it('does nothing when layer is not found', () => {
      const mockMap = {
        removeAll: vi.fn(),
        add: vi.fn(),
        findLayerById: vi.fn().mockReturnValue(null),
      }
      const mapView = shallowRef({ map: mockMap } as never)
      const { toggleLayer } = useLayer(mapView)

      expect(() => toggleLayer(99, true)).not.toThrow()
    })

    it('does nothing when mapView is null', () => {
      const mapView = shallowRef(null)
      const { toggleLayer } = useLayer(mapView as never)
      expect(() => toggleLayer(1, true)).not.toThrow()
    })
  })
})
