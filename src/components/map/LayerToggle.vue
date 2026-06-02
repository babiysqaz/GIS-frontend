<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLayerStore } from '@/stores/layerStore'
import { useLayer } from '@/composables/useLayer'
import { useMapStore } from '@/stores/mapStore'
import Checkbox from 'primevue/checkbox'

const layerStore = useLayerStore()
const mapStore = useMapStore()
const { mapView } = storeToRefs(mapStore)
const { toggleLayer } = useLayer(mapView)
const searchQuery = ref('')

const filteredLayers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return layerStore.layers
  return layerStore.layers.filter((layer) =>
    layer.name.toLowerCase().includes(query)
  )
})

function onCheckboxChange(id: number, value: boolean) {
  toggleLayer(id, value)
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div
    v-if="layerStore.layers.length"
    class="rounded-xl bg-white p-4 shadow-md"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">圖層</p>
        <p class="text-sm text-slate-500">搜尋並切換圖層顯示</p>
      </div>
      <button
        v-if="searchQuery"
        type="button"
        @click="clearSearch"
        class="text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        清除
      </button>
    </div>

    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="搜尋圖層..."
        class="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <ul class="flex flex-col gap-2">
      <li
        v-if="!filteredLayers.length"
        class="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500"
      >
        無符合的圖層
      </li>
      <li
        v-for="layer in filteredLayers"
        :key="layer.id"
        class="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
      >
        <Checkbox
          :inputId="`layer-${layer.id}`"
          :modelValue="layer.visible"
          @update:modelValue="onCheckboxChange(layer.id, $event)"
          class="cursor-pointer"
          binary
        />
        <label :for="`layer-${layer.id}`" class="cursor-pointer text-slate-800">{{ layer.name }}</label>
      </li>
    </ul>
  </div>
</template>
