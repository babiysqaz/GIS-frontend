export interface Layer {
  id: number
  name: string
  description: string
  serviceUrl: string
  layerType: 'feature' | 'tile'
  visible: boolean
  opacity: number
  sortOrder: number
  renderer?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type LayerFormData = Omit<Layer, 'id' | 'createdAt' | 'updatedAt'>
