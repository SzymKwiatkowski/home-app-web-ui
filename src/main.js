import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Apply saved theme before first render to avoid flash
import { useThemeStore } from './stores/theme'
useThemeStore() // constructor call triggers applyTheme()

app.mount('#app')