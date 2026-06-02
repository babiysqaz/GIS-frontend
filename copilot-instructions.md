# Copilot instructions for GIS-frontend

Purpose
- Provide precise, actionable rules for Copilot-style code generation and edits within this repository.

Scope
- Frontend only: files under `src/` in this workspace (Vue 3 + TypeScript + Vite).
- Do not modify backend code in `gis-backend/` unless explicitly asked.

High-level goals
- Maintain strict TypeScript safety and project conventions.
- Keep ArcGIS usage correct (shallowRef for ArcGIS objects, MapView lifecycle rules).
- Keep UI consistent with Tailwind + PrimeVue (unstyled mode).

Coding conventions
- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Components: PascalCase filenames and exports (e.g., `MapViewer.vue`).
- Composables: `use` prefix, camelCase filenames (e.g., `useMap.ts`).
- Stores: camelCase with `Store` suffix (e.g., `layerStore.ts`), use Pinia setup syntax.
- Types: PascalCase, no `I` prefix. Place interfaces under `src/types/`.
- Props: prefer `defineProps<T>()`; emits: `defineEmits<{ ... }>()`.
- Avoid `any`; prefer `unknown` + type guards when necessary. `strict: true` enforced.

ArcGIS-specific rules
- Always use `shallowRef` for `Map`, `MapView`, and ArcGIS `Layer` objects.
- `new MapView()` must only be created inside `MapViewer.vue`'s `onMounted` or inside `useMap()` helper invoked from `MapViewer.vue`.
- Do not control visibility by `map.add()` / `map.remove()`; set `layer.visible` instead.
- Use backend `layer.id` (stringified) as ArcGIS layer `id` to allow `findLayerById`.

API and services
- Do not import `axios` directly in components. Use `src/services/api.ts` which exports a configured instance.
- All network calls should live in `src/services/*` (e.g., `layerService.ts`, `authService.ts`).
- Services return typed responses; add types in `src/types/` and use them in stores and composables.

State management
- Use Pinia setup-style stores. Handle `loading` and `error` in every async action.
- Store examples: `useLayerStore()` exposes `layers: Ref<Layer[]>`, `loading: Ref<boolean>`, `error: Ref<string|null>`.

UI and components
- Use PrimeVue components where appropriate and adapt styling with Tailwind utilities.
- Keep templates declarative: move complex logic into `computed`, composables, or methods — avoid heavy expressions inside templates.
- Shared primitives (ConfirmDialog, Toast) should be wired at a high layout level (e.g., `AdminLayout.vue`).

TypeScript and safety
- Do not use `// @ts-ignore` except with a documented reason in the same commit message and code comment.
- Avoid non-null assertions (`!`) — prefer optional chaining and explicit checks.
- All API responses must have corresponding interfaces in `src/types/`.

Files & locations (quick reference)
- Composables: `src/composables/` (useMap.ts, useLayer.ts, useAuth.ts)
- Components: `src/components/` (map/, admin/, shared/)
- Pages: `src/pages/` (MapPage.vue, LoginPage.vue, admin/*)
- Stores: `src/stores/` (authStore.ts, layerStore.ts, mapStore.ts)
- Services: `src/services/` (api.ts, layerService.ts, authService.ts)
- Types: `src/types/` (layer.ts, user.ts)

Testing & build
- Run TypeScript checks before commits: `npm run type-check`.
- Run unit tests with `npm run test` (Vitest). Provide tests for important composables and stores when adding features.
- Build with `npm run build` and ensure no type errors.

Forbidden actions (do NOT do)
- Import `axios` directly in components; always use `src/services/api.ts`.
- Call APIs directly from components; use `services` + `stores`.
- Instantiate `MapView` outside of `MapViewer.vue` or `useMap()` invoked by it.
- Wrap ArcGIS objects in `ref()` (use `shallowRef()` instead).
- Use `localStorage` directly for JWT management — use `authStore`.

Commit & PR guidance for Copilot edits
- Keep changes minimal and focused to the user's requested scope.
- If adding new exports or files, update index or usage sites and run `npm run type-check`.
- Add tests for behavioral changes when feasible and run `npm run test` locally.

When uncertain
- Ask the user for clarification rather than guessing API shapes, credentials, or environment values.
- If a change affects Map behavior or ArcGIS integration, prefer small, reversible edits and include notes on how to test (e.g., steps to open `MapPage.vue` and verify layer visibility toggles).

Examples of safe transformations for Copilot
- Extracting table filters into a composable and moving toolbar UI to parent (preserve props/emits and types).
- Converting inline template logic into `computed` properties or composables.
- Replacing `ref<MapView | null>(null)` with `shallowRef<MapView | null>(null)` and adjusting dependent code.

Contact / context
- Refer to `CLAUDE.md` for project rationale and additional constraints.

---
Generated: follow these rules when making automated edits or suggestions. If the user asks you to ignore any rule, confirm explicitly.
