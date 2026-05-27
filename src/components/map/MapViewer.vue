<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useMap } from '@/composables/useMap'
import { useLayer } from '@/composables/useLayer'
import { useLayerStore } from '@/stores/layerStore'
import { useMapStore } from '@/stores/mapStore'

const mapContainer = ref<HTMLDivElement | null>(null)
const { mapView, initMap } = useMap()
const { syncLayers } = useLayer(mapView)
const layerStore = useLayerStore()
const mapStore = useMapStore()

onMounted(() => {
  if (mapContainer.value) {
    initMap(mapContainer.value)
    mapStore.mapView = mapView.value
  }
})

watchEffect(() => {
  const view = mapView.value
  const layers = layerStore.layers
  if (!view || !layers.length) return
  view.when(() => syncLayers(layers))
})
</script>

<template>
  <div ref="mapContainer" class="h-full w-full" />
</template>
