# GIS 可視化決策平台 — 前端

Vue 3 + TypeScript + ArcGIS Maps SDK 前端，提供地圖瀏覽介面與管理員後台。

## 技術棧

- **框架**：Vue 3（Composition API + `<script setup>`）
- **語言**：TypeScript（strict mode）
- **狀態管理**：Pinia
- **路由**：Vue Router 4
- **UI 元件**：PrimeVue 4（unstyled mode）
- **樣式**：Tailwind CSS v3
- **地圖**：ArcGIS Maps SDK for JavaScript
- **HTTP**：Axios（含 interceptor）
- **建構工具**：Vite
- **測試**：Vitest + Vue Test Utils

## 本機開發

```bash
# 1. 安裝依賴
npm install

# 2. 建立 .env.local（複製範本後填入後端 URL）
cp .env.example .env.local

# 3. 啟動開發伺服器
npm run dev
```

開發伺服器啟動後：
- 前台地圖：http://localhost:5173
- 後台管理：http://localhost:5173/admin/layers

## 環境變數

複製 `.env.example` 為 `.env.local` 並填寫：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 指令

```bash
npm run dev           # 啟動開發伺服器（port 5173）
npm run build         # 正式版本建構（含 type-check）
npm run type-check    # tsc --noEmit
npm run lint          # ESLint 品質檢查
npm run format        # Prettier 格式化
npm run format:check  # Prettier 格式檢查（CI 用）
npm run test          # Vitest
```

## 目錄結構

```
src/
├── components/
│   ├── map/          # MapViewer、LayerToggle、LayerLegend
│   └── admin/        # LayerForm、LayerTable、LayerTableToolbar
├── composables/      # useMap、useLayer、useAuth、useLayerTableFilters
├── layouts/          # PublicLayout（地圖）、AdminLayout（後台）
├── pages/            # MapPage、LoginPage、admin/LayersPage、admin/LayerEditPage
├── router/
├── services/         # api.ts（Axios instance）、layerService、authService
├── stores/           # authStore、layerStore、mapStore
└── types/            # layer.ts、user.ts
```
