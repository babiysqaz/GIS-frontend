<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Select from 'primevue/select'
import type { LayerTypeFilter, LayerVisibleFilter } from '@/composables/useLayerTableFilters'

const props = defineProps<{
  search: string
  typeFilter: LayerTypeFilter
  visibleFilter: LayerVisibleFilter
  pageSize: number
  typeOptions: Array<{ label: string; value: string }>
  visibleOptions: Array<{ label: string; value: string }>
  pageSizeOptions: Array<{ label: string; value: number }>
}>()

const emit = defineEmits<{
  (event: 'update:search', value: string): void
  (event: 'update:typeFilter', value: LayerTypeFilter): void
  (event: 'update:visibleFilter', value: LayerVisibleFilter): void
  (event: 'update:pageSize', value: number): void
}>()

const searchProxy = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

const typeFilterProxy = computed({
  get: () => props.typeFilter,
  set: (value: LayerTypeFilter) => emit('update:typeFilter', value),
})

const visibleFilterProxy = computed({
  get: () => props.visibleFilter,
  set: (value: LayerVisibleFilter) => emit('update:visibleFilter', value),
})

const pageSizeProxy = computed({
  get: () => props.pageSize,
  set: (value: number) => emit('update:pageSize', value),
})
</script>

<template>
  <div class="border bg-white px-4 py-3 rounded-md shadow-sm">
    <div class="flex flex-wrap items-end gap-3">
      <!-- 搜尋欄 -->
      <div class="flex-1 min-w-[200px] flex flex-col gap-1">
        <span class="text-xs font-medium text-gray-500">搜尋</span>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchProxy" placeholder="搜尋名稱或描述" class="w-full" />
        </IconField>
      </div>

      <!-- 篩選條件群組 -->
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500">類型</span>
          <Select
            v-model="typeFilterProxy"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            class="min-w-[120px]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500">預設可見性</span>
          <Select
            v-model="visibleFilterProxy"
            :options="visibleOptions"
            optionLabel="label"
            optionValue="value"
            class="min-w-[120px]"
          />
        </div>
      </div>

      <!-- 分頁設定（靠右） -->
      <div class="flex flex-col gap-1 ml-auto">
        <span class="text-xs font-medium text-gray-500">每頁顯示</span>
        <Select
          v-model="pageSizeProxy"
          :options="pageSizeOptions"
          optionLabel="label"
          optionValue="value"
          class="min-w-[100px]"
        />
      </div>
    </div>
  </div>
</template>
