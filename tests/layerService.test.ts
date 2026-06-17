import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchLayers,
  fetchAllLayers,
  createLayer,
  updateLayer,
  deleteLayer,
  batchUpdateSortOrder,
} from '@/services/layerService'
import api from '@/services/api'
import type { Layer } from '@/types/layer'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: 1,
    name: 'Test',
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

const emptyPage = { items: [], total: 0, page: 1, size: 20 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchLayers', () => {
  it('calls /layers/ with no query params when no args provided', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: emptyPage })

    const result = await fetchLayers()

    expect(api.get).toHaveBeenCalledWith('/layers/', { params: {} })
    expect(result).toEqual(emptyPage)
  })

  it('converts camelCase layerType to snake_case layer_type in query', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: emptyPage })

    await fetchLayers({ page: 2, layerType: 'feature' })

    expect(api.get).toHaveBeenCalledWith('/layers/', {
      params: { page: 2, layer_type: 'feature' },
    })
  })

  it('omits null visible but includes false visible', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: emptyPage })
      .mockResolvedValueOnce({ data: emptyPage })

    await fetchLayers({ visible: null })
    expect(api.get).toHaveBeenLastCalledWith('/layers/', { params: {} })

    await fetchLayers({ visible: false })
    expect(api.get).toHaveBeenLastCalledWith('/layers/', { params: { visible: false } })
  })
})

describe('batchUpdateSortOrder', () => {
  it('sends items as body to PATCH /layers/sort-order', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: undefined })

    const items = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
    ]
    await batchUpdateSortOrder(items)

    expect(api.patch).toHaveBeenCalledWith('/layers/sort-order', items)
  })
})

describe('fetchAllLayers', () => {
  it('calls GET /layers/all and returns data', async () => {
    const data = [makeLayer({ id: 1 }), makeLayer({ id: 2 })]
    vi.mocked(api.get).mockResolvedValueOnce({ data })

    const result = await fetchAllLayers()

    expect(api.get).toHaveBeenCalledWith('/layers/all')
    expect(result).toEqual(data)
  })
})

describe('createLayer', () => {
  it('POSTs to /layers/ and returns the created layer', async () => {
    const layer = makeLayer({ id: 99, name: 'New Layer' })
    vi.mocked(api.post).mockResolvedValueOnce({ data: layer })

    const formData = {
      name: 'New Layer',
      description: '',
      serviceUrl: 'http://example.com',
      visible: true,
      opacity: 1,
      sortOrder: 0,
    }
    const result = await createLayer(formData)

    expect(api.post).toHaveBeenCalledWith('/layers/', formData)
    expect(result).toEqual(layer)
  })
})

describe('updateLayer', () => {
  it('PATCHes /layers/:id and returns the updated layer', async () => {
    const updated = makeLayer({ id: 5, name: 'Updated' })
    vi.mocked(api.patch).mockResolvedValueOnce({ data: updated })

    const result = await updateLayer(5, { name: 'Updated' })

    expect(api.patch).toHaveBeenCalledWith('/layers/5', { name: 'Updated' })
    expect(result).toEqual(updated)
  })
})

describe('deleteLayer', () => {
  it('DELETEs /layers/:id and returns undefined', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: null })

    const result = await deleteLayer(3)

    expect(api.delete).toHaveBeenCalledWith('/layers/3')
    expect(result).toBeUndefined()
  })
})
