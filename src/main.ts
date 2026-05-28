import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'

import App from './App.vue'
import router from './router'
// @ts-ignore: CSS module import for Vite build
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { unstyled: true })
app.use(ToastService)
app.use(ConfirmationService)
app.component('ConfirmDialog', ConfirmDialog)

app.mount('#app')
