import api from './api'
import type { Layer, LayerFormData, LayerListParams, PaginatedLayersResponse } from '@/types/layer'

/** 取得所有圖層（不分頁），供地圖前台使用 */
export const fetchAllLayers = (): Promise<Layer[]> => api.get('/layers/all').then((r) => r.data)

/** 取得分頁圖層列表，供後台管理使用 */
export const fetchLayers = (params: LayerListParams = {}): Promise<PaginatedLayersResponse> => {
  const query: Record<string, string | number | boolean> = {}
  if (params.page != null) query.page = params.page
  if (params.size != null) query.size = params.size
  if (params.search) query.search = params.search
  if (params.layerType) query.layer_type = params.layerType
  if (params.visible != null) query.visible = params.visible
  return api.get('/layers/', { params: query }).then((r) => r.data)
}

export const createLayer = (data: LayerFormData): Promise<Layer> =>
  api.post('/layers/', data).then((r) => r.data)

export const updateLayer = (id: number, data: Partial<LayerFormData>): Promise<Layer> =>
  api.patch(`/layers/${id}`, data).then((r) => r.data)

export const deleteLayer = (id: number): Promise<void> =>
  api.delete(`/layers/${id}`).then(() => undefined)

export const batchUpdateSortOrder = (items: { id: number; sortOrder: number }[]): Promise<void> =>
  api.patch('/layers/sort-order', items).then(() => undefined)
