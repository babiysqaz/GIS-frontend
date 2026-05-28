import type { ShallowRef } from 'vue'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
import type MapView from '@arcgis/core/views/MapView'
import type { Layer } from '@/types/layer'

export function useLayer(mapView: ShallowRef<MapView | null>) {
  function buildArcGISLayer(layer: Layer) {
    const common = {
      id: String(layer.id),
      opacity: layer.opacity,
      visible: layer.visible,
    }
    return layer.layerType === 'tile'
      ? new TileLayer({ url: layer.serviceUrl, ...common })
      : new FeatureLayer({ url: layer.serviceUrl, ...common })
  }

  function syncLayers(layers: Layer[]) {
    const map = mapView.value?.map
    if (!map) return
    map.removeAll()
    ;[...layers]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((l) => map.add(buildArcGISLayer(l)))
  }

  function toggleLayer(layerId: number, visible: boolean) {
    const layer = mapView.value?.map?.findLayerById(String(layerId))
    if (layer) layer.visible = visible
  }

  return { syncLayers, toggleLayer }
}
