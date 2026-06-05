<template>
  <Toast />
  <RouterView />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { initNotify } from '@/services/notify'

initNotify(useToast())
</script>
