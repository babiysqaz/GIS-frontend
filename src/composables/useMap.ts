import { shallowRef, onUnmounted } from 'vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'

export function useMap() {
  const mapView = shallowRef<MapView | null>(null)

  function initMap(container: HTMLDivElement) {
    const map = new Map({ basemap: 'streets-vector' })
    mapView.value = new MapView({
      container,
      map,
      zoom: 8,
      center: [120.9605, 23.6978],
      popup: {
        defaultPopupTemplateEnabled: true,
      },
    })
  }

  onUnmounted(() => {
    mapView.value?.destroy()
    mapView.value = null
  })

  return { mapView, initMap }
}
