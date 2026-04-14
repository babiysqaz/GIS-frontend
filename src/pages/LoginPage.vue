<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
  } catch {
    errorMsg.value = '帳號或密碼錯誤'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
      <h1 class="mb-6 text-2xl font-bold text-gray-800">GIS 平台登入</h1>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">電子郵件</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">密碼</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>
