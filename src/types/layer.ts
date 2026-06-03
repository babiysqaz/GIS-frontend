export interface LegendItem {
  label?: string
  url?: string
  imageData?: string
  contentType?: string
  height?: number
  width?: number
}

export interface LegendLayer {
  layerId: number
  layerName: string
  layerType?: string
  minScale?: number
  maxScale?: number
  legend: LegendItem[]
}

export interface Layer {
  id: number
  name: string
  description: string
  serviceUrl: string
  layerType: 'feature' | 'tile'
  visible: boolean
  opacity: number
  sortOrder: number
  legend?: LegendLayer[] | Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type LayerFormData = Omit<Layer, 'id' | 'createdAt' | 'updatedAt'>
