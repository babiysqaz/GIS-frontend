<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
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
  <div class="border bg-white px-4 py-4">
    <div class="w-full flex items-center gap-3">
      <div class="w-[50%]">
        <InputText v-model="searchProxy" placeholder="搜尋名稱或描述" class="w-full" />
      </div>

      <div class="flex flex-wrap gap-2">
        <Select
          v-model="typeFilterProxy"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />

        <Select
          v-model="visibleFilterProxy"
          :options="visibleOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />

        <Select
          v-model="pageSizeProxy"
          :options="pageSizeOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
