<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLayerStore } from '@/stores/layerStore'
import { useLayer } from '@/composables/useLayer'
import { useMapStore } from '@/stores/mapStore'
import Checkbox from 'primevue/checkbox'

const layerStore = useLayerStore()
const mapStore = useMapStore()
const { mapView } = storeToRefs(mapStore)
const { toggleLayer } = useLayer(mapView)

function onCheckboxChange(id: number, value: boolean) {
  toggleLayer(id, value)
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
        <Checkbox
          :inputId="`layer-${layer.id}`"
          :modelValue="layer.visible"
          @update:modelValue="onCheckboxChange(layer.id, $event)"
          class="cursor-pointer"
          binary
        />
        <label :for="`layer-${layer.id}`" class="cursor-pointer text-gray-700">{{ layer.name }}</label>
      </li>
    </ul>
  </div>
</template>
