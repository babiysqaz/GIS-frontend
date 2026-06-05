import type { ToastServiceMethods } from 'primevue/toastservice'

let _toast: ToastServiceMethods | null = null

export function initNotify(toast: ToastServiceMethods): void {
  _toast = toast
}

export function notifyError(summary: string): void {
  _toast?.add({ severity: 'error', summary, life: 4000 })
}
