import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type MapView from '@arcgis/core/views/MapView'

export const useMapStore = defineStore('map', () => {
  const mapView = shallowRef<MapView | null>(null)
  const visibleLayerIds = ref<Set<number>>(new Set())

  return { mapView, visibleLayerIds }
})
