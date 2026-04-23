import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Apply saved theme immediately (no network needed)
import { useThemeStore } from './stores/theme'
useThemeStore()

// Init users store (local only)
import { useUsersStore } from './stores/users'
useUsersStore()

app.mount('#app')
