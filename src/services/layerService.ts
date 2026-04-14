import api from './api'
import type { Layer, LayerFormData } from '@/types/layer'

export const fetchLayers = (): Promise<Layer[]> =>
  api.get('/layers/').then((r) => r.data)

export const createLayer = (data: LayerFormData): Promise<Layer> =>
  api.post('/layers/', data).then((r) => r.data)

export const updateLayer = (id: number, data: Partial<LayerFormData>): Promise<Layer> =>
  api.patch(`/layers/${id}`, data).then((r) => r.data)

export const deleteLayer = (id: number): Promise<void> =>
  api.delete(`/layers/${id}`).then(() => undefined)
