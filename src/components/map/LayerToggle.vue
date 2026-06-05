<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const selectedId = ref<number | null>(null)

// Local-only state — never written back to store or API
const localOrder = ref<number[]>([])
const localOpacity = ref<Record<number, number>>({})

watch(
  () => layerStore.layers,
  (layers) => {
    if (!layers.length || localOrder.value.length) return
    // index 0 = visually on top (highest sortOrder first)
    localOrder.value = [...layers].sort((a, b) => b.sortOrder - a.sortOrder).map((l) => l.id)
    const opacityMap: Record<number, number> = {}
    layers.forEach((l) => {
      opacityMap[l.id] = Math.round(l.opacity * 100)
    })
    localOpacity.value = opacityMap
  },
  { immediate: true },
)

const filteredLayers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return layerStore.layers
  return layerStore.layers.filter((layer) => layer.name.toLowerCase().includes(query))
})

// Returns 1-based rank from top (1 = visually on top on map)
function renderRank(id: number): number {
  return localOrder.value.indexOf(id) + 1
}

function onCheckboxChange(id: number, value: boolean) {
  toggleLayer(id, value)
  layerStore.setLayerVisible(id, value)
}

function clearSearch() {
  searchQuery.value = ''
}

function toggleSelected(id: number) {
  selectedId.value = selectedId.value === id ? null : id
}

function applyOrderToMap() {
  const map = mapView.value?.map
  if (!map)
    return // localOrder[0] = visually on top = highest ArcGIS index
    // Apply from bottom layer (last in localOrder) upward so each reorder lands correctly
  ;[...localOrder.value].reverse().forEach((id, i) => {
    const layer = map.findLayerById(String(id))
    if (layer) map.reorder(layer, i)
  })
}

function moveUp(id: number) {
  const idx = localOrder.value.indexOf(id)
  if (idx <= 0) return
  const next = [...localOrder.value]
  ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
  localOrder.value = next
  applyOrderToMap()
}

function moveDown(id: number) {
  const idx = localOrder.value.indexOf(id)
  if (idx >= localOrder.value.length - 1) return
  const next = [...localOrder.value]
  ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
  localOrder.value = next
  applyOrderToMap()
}

function onOpacityChange(id: number, value: number) {
  localOpacity.value = { ...localOpacity.value, [id]: value }
  const layer = mapView.value?.map?.findLayerById(String(id))
  if (layer) layer.opacity = value / 100
}
</script>

<template>
  <div
    v-if="layerStore.layers.length"
    class="flex h-full flex-col rounded-xl bg-white p-4 shadow-md"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">圖層</p>
        <p class="text-sm text-slate-500">搜尋並切換圖層顯示</p>
      </div>
      <button
        v-if="searchQuery"
        type="button"
        class="text-xs font-medium text-blue-600 hover:text-blue-800"
        @click="clearSearch"
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

    <ul class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
      <li
        v-if="!filteredLayers.length"
        class="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500"
      >
        無符合的圖層
      </li>
      <li
        v-for="layer in filteredLayers"
        :key="layer.id"
        class="rounded border border-slate-200 bg-slate-50 text-sm"
      >
        <!-- Main row -->
        <div class="flex items-center gap-2 px-3 py-2">
          <Checkbox
            :input-id="`layer-${layer.id}`"
            :model-value="layer.visible"
            class="cursor-pointer"
            binary
            @update:model-value="onCheckboxChange(layer.id, $event)"
          />
          <label :for="`layer-${layer.id}`" class="flex-1 cursor-pointer text-slate-800">
            {{ layer.name }}
          </label>
          <button
            type="button"
            class="rounded p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            :class="{ 'bg-slate-200 text-slate-600': selectedId === layer.id }"
            title="調整排序與透明度"
            @click="toggleSelected(layer.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
              />
            </svg>
          </button>
        </div>

        <!-- Expanded controls -->
        <div v-if="selectedId === layer.id" class="space-y-2 border-t border-slate-200 px-3 py-2">
          <!-- Opacity -->
          <div class="flex items-center gap-1.5">
            <span class="w-12 text-xs text-slate-400">透明度</span>
            <input
              type="range"
              :value="localOpacity[layer.id] ?? 100"
              min="0"
              max="100"
              class="flex-1 accent-blue-500"
              @input="onOpacityChange(layer.id, +($event.target as HTMLInputElement).value)"
            />
            <span class="w-8 text-right text-xs text-slate-500">
              {{ localOpacity[layer.id] ?? 100 }}%
            </span>
          </div>
          
          <!-- Reorder -->
          <div class="flex items-center gap-1.5">
            <span class="w-14 shrink-0 text-xs text-slate-400">疊加順序</span>
            <button
              type="button"
              :disabled="localOrder[0] === layer.id"
              class="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              @click="moveUp(layer.id)"
            >
              ↑ 上移
            </button>
            <button
              type="button"
              :disabled="localOrder[localOrder.length - 1] === layer.id"
              class="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              @click="moveDown(layer.id)"
            >
              ↓ 下移
            </button>
          </div>

          <div class="ml-auto text-xs text-slate-400">
            第 {{ renderRank(layer.id) }} / {{ localOrder.length }} 層
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
