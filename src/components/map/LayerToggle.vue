<script setup lang="ts">
import { useLayerStore } from '@/stores/layerStore'
import { useLayer } from '@/composables/useLayer'
import { useMapStore } from '@/stores/mapStore'

const layerStore = useLayerStore()
const mapStore = useMapStore()
const { toggleLayer } = useLayer(mapStore.mapView as Parameters<typeof useLayer>[0])

function onToggle(id: number, visible: boolean) {
  toggleLayer(id, visible)
}
</script>

<template>
  <div
    v-if="layerStore.layers.length"
    class="rounded-xl bg-white p-3 shadow-md"
  >
    <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">圖層</p>
    <ul class="flex flex-col gap-1">
      <li
        v-for="layer in layerStore.layers"
        :key="layer.id"
        class="flex items-center gap-2 text-sm"
      >
        <input
          type="checkbox"
          :checked="layer.visible"
          class="cursor-pointer"
          @change="onToggle(layer.id, ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ layer.name }}</span>
      </li>
    </ul>
  </div>
</template>
