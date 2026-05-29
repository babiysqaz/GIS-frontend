<script setup lang="ts">
import { computed } from 'vue'
import { useLayerStore } from '@/stores/layerStore'

const layerStore = useLayerStore()
const visibleLayers = computed(() => layerStore.layers.filter((l) => l.visible))
</script>

<template>
  <div
    v-if="visibleLayers.length"
    class="rounded-xl bg-white p-3 shadow-md"
  >
    <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">圖例</p>
    <ul class="flex flex-col gap-1">
      <li
        v-for="layer in visibleLayers"
        :key="layer.id"
        class="flex items-center gap-2 text-sm"
      >
        <span class="inline-block h-3 w-3 rounded-full bg-blue-500" />
        <span class="text-gray-700">{{ layer.name }}</span>
      </li>
    </ul>
  </div>
</template>
