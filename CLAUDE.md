# GIS 可視化決策平台 — 前端

## 專案概覽

透過可自由設定的可視化圖層幫助用戶做出更好的決策。
前台供使用者切換/查看圖層，後台供管理員進行圖層 CRUD 與權限管理。
地圖渲染完全在前端透過 ArcGIS Maps SDK for JavaScript 完成。

**Repo:** `https://github.com/babiysqaz/GIS-frontend`
**後端 API base URL:** 從 `VITE_API_BASE_URL` 環境變數取得

---

## 技術棧

| 層級 | 套件 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| UI 元件 | PrimeVue 4（unstyled mode） |
| 樣式 | Tailwind CSS v3 |
| 語言 | TypeScript（strict mode） |
| 狀態管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP | Axios（含 interceptor） |
| 地圖 | ArcGIS Maps SDK for JavaScript（ES modules） |
| 建構工具 | Vite |
| 測試 | Vitest + Vue Test Utils |
| Lint | ESLint + Prettier |

---

## 目錄結構

```
src/
├── assets/
├── components/
│   ├── map/
│   │   ├── MapViewer.vue        # 主地圖容器，掛載 MapView
│   │   ├── LayerToggle.vue      # 圖層顯示/隱藏開關列表
│   │   └── LayerLegend.vue      # 圖例面板
│   ├── admin/
│   │   ├── LayerForm.vue        # 圖層新增/編輯表單
│   │   ├── LayerTable.vue       # 圖層列表（含 CRUD 操作）
│   │   └── LayerTableToolbar.vue  # 圖層列表工具列（搜尋、篩選）
│   └── shared/                  # Button、Modal、ConfirmDialog 等共用元件
├── composables/
│   ├── useMap.ts                # MapView 實例建立、銷毀、ref
│   ├── useLayer.ts              # 圖層 add/toggle/sync 邏輯
│   ├── useAuth.ts               # 登入狀態、token 管理
│   └── useLayerTableFilters.ts  # 圖層列表搜尋／類型／可見性篩選
├── layouts/
│   ├── PublicLayout.vue         # 前台 layout（全螢幕地圖）
│   └── AdminLayout.vue          # 後台 layout（側邊欄 + 內容區）
├── pages/
│   ├── MapPage.vue              # 前台地圖主頁
│   ├── LoginPage.vue
│   └── admin/
│       ├── LayersPage.vue       # 圖層管理列表
│       └── LayerEditPage.vue    # 圖層新增/編輯
├── router/
│   └── index.ts
├── stores/
│   ├── authStore.ts             # 認證狀態、角色、token
│   ├── layerStore.ts            # 圖層設定資料（來自後端）
│   └── mapStore.ts              # MapView shallowRef、可見圖層 id 集合
├── services/
│   ├── api.ts                   # Axios 實例 + interceptor
│   ├── layerService.ts          # 圖層 CRUD API 呼叫
│   └── authService.ts           # 登入/登出 API 呼叫
└── types/
    ├── layer.ts
    └── user.ts
```

---

## 命名規範

- **元件檔案：** PascalCase（`MapViewer.vue`）
- **Composable：** `use` 前綴 + camelCase（`useMap.ts`）
- **Store：** camelCase + `Store` 後綴（`layerStore.ts`）
- **型別 / Interface：** PascalCase，不加 `I` 前綴
- **CSS class：** Tailwind utility-first；自訂 class 用 kebab-case
- **API 函式：** 動詞 + 名詞（`fetchLayers`、`createLayer`、`updateLayer`、`deleteLayer`）

---

## TypeScript 規範

- 啟用 `strict: true`，禁止 `any`；確實需要時用 `unknown` + 型別守衛
- 所有 API response 必須有對應 interface，放 `src/types/`
- Props 用 `defineProps<T>()`，Emits 用 `defineEmits<{ ... }>()`
- 避免 `!`（非空斷言），改用 `?.` 或明確條件判斷

**核心型別（`src/types/layer.ts`）：**

```ts
export interface LegendItem {
  label?: string
  url?: string
  imageData?: string
  contentType?: string
  height?: number
  width?: number
}

export interface LegendLayer {
  layerId: number
  layerName: string
  layerType?: string
  minScale?: number
  maxScale?: number
  legend: LegendItem[]
}

export interface Layer {
  id: number
  name: string
  description: string
  serviceUrl: string              // ArcGIS Feature/Tile Service URL
  layerType: 'feature' | 'tile'
  visible: boolean
  opacity: number                 // 0–1
  sortOrder: number               // 圖層疊加順序（數字越小越底層）
  legend?: LegendLayer[]          // 後端自動從 ArcGIS 服務拉取並儲存
  renderer?: Record<string, unknown>  // ArcGIS renderer JSON（可選）
  createdAt: string
  updatedAt: string
}

export type LayerFormData = Omit<Layer, 'id' | 'createdAt' | 'updatedAt'>
```

**使用者型別（`src/types/user.ts`）：**

```ts
export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}
```

---

## ArcGIS Maps SDK 規範

### 安裝

```bash
npm install @arcgis/core
```

### Vite 設定

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['@arcgis/core'],
  },
})
```

### 引入方式

```ts
// ES modules，不用 AMD/CDN require
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
```

### MapView 生命週期（`useMap.ts`）

```ts
import { shallowRef, onUnmounted } from 'vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'

export function useMap() {
  const mapView = shallowRef<MapView | null>(null)  // shallowRef，不深層響應

  function initMap(container: HTMLDivElement) {
    const map = new Map({ basemap: 'streets-vector' })
    mapView.value = new MapView({
      container,
      map,
      zoom: 10,
      center: [120.9605, 23.6978],  // 台灣中心點
    })
  }

  onUnmounted(() => {
    mapView.value?.destroy()
    mapView.value = null
  })

  return { mapView, initMap }
}
```

### 圖層操作（`useLayer.ts`）

```ts
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
import type { ShallowRef } from 'vue'
import type MapView from '@arcgis/core/views/MapView'
import type { Layer } from '@/types/layer'

export function useLayer(mapView: ShallowRef<MapView | null>) {

  function buildArcGISLayer(layer: Layer) {
    const common = { id: String(layer.id), opacity: layer.opacity, visible: layer.visible }
    return layer.layerType === 'tile'
      ? new TileLayer({ url: layer.serviceUrl, ...common })
      : new FeatureLayer({ url: layer.serviceUrl, ...common })
  }

  // 後端資料同步至地圖（重建所有圖層）
  function syncLayers(layers: Layer[]) {
    const map = mapView.value?.map
    if (!map) return
    map.removeAll()
    ;[...layers].sort((a, b) => a.sortOrder - b.sortOrder).forEach((l) => {
      map.add(buildArcGISLayer(l))
    })
  }

  // 切換可見性（不 add/remove，改 visible 屬性）
  function toggleLayer(layerId: number, visible: boolean) {
    const layer = mapView.value?.map.findLayerById(String(layerId))
    if (layer) layer.visible = visible
  }

  return { syncLayers, toggleLayer }
}
```

**規則：**
- ArcGIS 物件（`Map`、`MapView`、`Layer`）一律用 `shallowRef`，不用 `ref`
- `new MapView()` 只在 `MapViewer.vue` 的 `onMounted` 內建立
- 顯示/隱藏改 `layer.visible`，不用 `map.add()` / `map.remove()`
- ArcGIS layer 的 `id` 固定設為後端 `layer.id` 字串化，供 `findLayerById` 查找
- 圖層疊加順序由後端 `sortOrder` 控制，sync 時排序後依序 `map.add()`

---

## Axios 與 API 規範

```ts
// services/api.ts
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) router.push('/login')
    return Promise.reject(err)
  }
)

export default api
```

```ts
// services/layerService.ts
import api from './api'
import type { Layer, LayerFormData } from '@/types/layer'

export const fetchLayers = (): Promise<Layer[]> =>
  api.get('/layers').then((r) => r.data)

export const createLayer = (data: LayerFormData): Promise<Layer> =>
  api.post('/layers', data).then((r) => r.data)

export const updateLayer = (id: number, data: Partial<LayerFormData>): Promise<Layer> =>
  api.patch(`/layers/${id}`, data).then((r) => r.data)

export const deleteLayer = (id: number): Promise<void> =>
  api.delete(`/layers/${id}`).then(() => undefined)
```

---

## 路由規範

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [{ path: '', name: 'map', component: MapPage }],
  },
  { path: '/login', name: 'login', component: LoginPage },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'layers', name: 'admin-layers', component: LayersPage },
      { path: 'layers/new', name: 'admin-layer-new', component: LayerEditPage },
      { path: 'layers/:id/edit', name: 'admin-layer-edit', component: LayerEditPage },
    ],
  },
]

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.role === 'admin' && auth.role !== 'admin') return { name: 'map' }
})
```

---

## Pinia Store 規範

使用 **setup 函式語法**；非同步 action 一律處理 loading / error：

```ts
// stores/layerStore.ts
export const useLayerStore = defineStore('layer', () => {
  const layers = ref<Layer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadLayers() {
    loading.value = true
    error.value = null
    try {
      layers.value = await fetchLayers()
    } catch {
      error.value = '載入圖層失敗'
    } finally {
      loading.value = false
    }
  }

  return { layers, loading, error, loadLayers }
})

// stores/mapStore.ts
export const useMapStore = defineStore('map', () => {
  const mapView = shallowRef<MapView | null>(null)  // shallowRef
  const visibleLayerIds = ref<Set<number>>(new Set())
  return { mapView, visibleLayerIds }
})
```

---

## PrimeVue 規範

- PrimeVue 4 **unstyled mode**，搭配 Tailwind
- 盡可能的使用 PrimeVue 元件
- 刪除確認用 `ConfirmDialog` + `useConfirm()`
- Toast 通知用 `useToast()`，`<Toast />` 放在 `AdminLayout.vue` 根層級

---

## 環境變數

`.env.local`（不進版控）：
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

`.env.example`（進版控，作為範本）：
```
VITE_API_BASE_URL=
```

只有 `VITE_` 開頭的變數會暴露給前端，透過 `import.meta.env.VITE_*` 存取。

---

## 開發指令

```bash
npm install           # 安裝依賴
npm run dev           # 啟動開發伺服器（port 5173）
npm run build         # 正式版本建構
npm run type-check    # tsc --noEmit
npm run lint          # eslint
npm run test          # vitest
```

---

## 禁止事項

- 禁止直接 `import axios from 'axios'`；只用 `services/api.ts` 的 instance
- 禁止在元件內直接呼叫 API；透過 `services/` 函式
- 禁止在 `<template>` 寫複雜邏輯；抽成 computed 或 composable
- 禁止用 `ref()` 包裝 ArcGIS 物件（MapView、Map、Layer）；一律用 `shallowRef()`
- 禁止在 `MapViewer.vue` 以外的地方 `new MapView()`
- 禁止用 `map.add()` / `map.remove()` 控制圖層可見性；改用 `layer.visible`
- 禁止 `// @ts-ignore`；如確實必要須附原因說明
- 禁止在 `localStorage` 直接存 JWT；統一由 `authStore` 管理
