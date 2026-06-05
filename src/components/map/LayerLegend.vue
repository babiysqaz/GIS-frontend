<script setup lang="ts">
import { computed } from 'vue'
import { useLayerStore } from '@/stores/layerStore'
import type { Layer, LegendItem, LegendLayer } from '@/types/layer'

type ArcGISColor = [number, number, number, number]
type RendererRecord = Record<string, unknown>
type RendererEntry = { label: string; color: ArcGISColor | null; symbolType: string }

const layerStore = useLayerStore()

function hasLegend(legend: Layer['legend']): boolean {
  if (!legend) return false
  return Array.isArray(legend) ? legend.length > 0 : Object.keys(legend).length > 0
}

const visibleLayers = computed(() =>
  layerStore.layers.filter(
    (l): l is Layer & { legend: LegendLayer[] | RendererRecord } =>
      l.visible && hasLegend(l.legend),
  ),
)

function isMapServerLegend(legend: LegendLayer[] | RendererRecord): legend is LegendLayer[] {
  return Array.isArray(legend)
}

// MapServer helpers
function imgSrc(item: LegendItem): string {
  if (item.imageData && item.contentType) {
    return `data:${item.contentType};base64,${item.imageData}`
  }
  return item.url ?? ''
}

// FeatureServer helpers
function arcgisToCss(color: ArcGISColor | null): string {
  if (!color) return 'rgba(128,128,128,1)'
  const [r, g, b, a = 255] = color
  return `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`
}

function extractSymbol(info: RendererRecord): RendererRecord | null {
  const sym = info.symbol
  return typeof sym === 'object' && sym !== null ? (sym as RendererRecord) : null
}

function symbolColor(symbol: RendererRecord | null): ArcGISColor | null {
  if (!symbol) return null
  const c = symbol.color
  if (!Array.isArray(c) || c.length < 3) return null
  return c as ArcGISColor
}

function symbolType(symbol: RendererRecord | null): string {
  return (symbol?.type as string | undefined) ?? 'esriSMS'
}

function getRendererEntries(renderer: RendererRecord): RendererEntry[] {
  const type = renderer.type as string

  if (type === 'simple') {
    const sym = extractSymbol(renderer)
    return [
      {
        label: (renderer.label as string | undefined) ?? '',
        color: symbolColor(sym),
        symbolType: symbolType(sym),
      },
    ]
  }

  if (type === 'classBreaks') {
    const infos = (renderer.classBreakInfos as RendererRecord[] | undefined) ?? []
    return infos.map((info) => {
      const sym = extractSymbol(info)
      return {
        label: (info.label as string | undefined) ?? '',
        color: symbolColor(sym),
        symbolType: symbolType(sym),
      }
    })
  }

  if (type === 'uniqueValue') {
    const infos = (renderer.uniqueValueInfos as RendererRecord[] | undefined) ?? []
    return infos.map((info) => {
      const sym = extractSymbol(info)
      return {
        label: (info.label as string | undefined) ?? '',
        color: symbolColor(sym),
        symbolType: symbolType(sym),
      }
    })
  }

  return []
}
</script>

<template>
  <div v-if="visibleLayers.length" class="rounded-xl bg-white p-3 shadow-md">
    <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">圖例</p>
    <div class="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
      <div v-for="layer in visibleLayers" :key="layer.id">
        <p class="mb-1 text-xs font-medium text-gray-600">{{ layer.name }}</p>

        <!-- MapServer: 後端預渲染的 base64 圖片 -->
        <template v-if="isMapServerLegend(layer.legend)">
          <template v-for="legendLayer in layer.legend" :key="legendLayer.layerId">
            <ul class="flex flex-col gap-1">
              <li
                v-for="(item, idx) in legendLayer.legend"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <img
                  v-if="imgSrc(item)"
                  :src="imgSrc(item)"
                  :width="item.width ?? 20"
                  :height="item.height ?? 20"
                  class="shrink-0"
                  alt=""
                />
                <span v-else class="inline-block h-3 w-3 shrink-0 rounded-full bg-blue-500" />
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </template>
        </template>

        <!-- FeatureServer: 從 renderer 定義產生色塊 -->
        <template v-else>
          <ul class="flex flex-col gap-1">
            <li
              v-for="(entry, idx) in getRendererEntries(layer.legend)"
              :key="idx"
              class="flex items-center gap-2 text-sm text-gray-700"
            >
              <!-- Line symbol -->
              <span
                v-if="entry.symbolType === 'esriSLS'"
                class="inline-block h-0.5 w-5 shrink-0"
                :style="{ backgroundColor: arcgisToCss(entry.color) }"
              />
              <!-- Polygon symbol -->
              <span
                v-else-if="entry.symbolType === 'esriSFS'"
                class="inline-block h-3 w-3 shrink-0 rounded-sm"
                :style="{ backgroundColor: arcgisToCss(entry.color) }"
              />
              <!-- Point / fallback: circle -->
              <span
                v-else
                class="inline-block h-3 w-3 shrink-0 rounded-full"
                :style="{ backgroundColor: arcgisToCss(entry.color) }"
              />
              <span>{{ entry.label }}</span>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>
