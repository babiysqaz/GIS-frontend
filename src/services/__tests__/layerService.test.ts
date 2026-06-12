import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLayers, batchUpdateSortOrder } from '@/services/layerService'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

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
