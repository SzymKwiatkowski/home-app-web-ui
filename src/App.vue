<template>
  <div class="app-layout">
    <!-- Global loading overlay shown during initial bootstrap -->
    <Transition name="fade">
      <div v-if="bootstrapping" class="bootstrap-overlay">
        <div class="bootstrap-spinner"></div>
        <p class="text-secondary text-sm">Loading your data…</p>
      </div>
    </Transition>

    <router-view />
    <BottomNav v-if="auth.isLoggedIn" @open-notifications="notifPanelOpen = true" />
    <NotificationPanel v-if="auth.isLoggedIn" v-model="notifPanelOpen" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'
import { bootstrapAppData } from '@/composables/useBootstrap'

const auth = useAuthStore()
const notifPanelOpen = ref(false)
const bootstrapping  = ref(false)

async function boot() {
  if (!auth.isLoggedIn) return
  bootstrapping.value = true
  await bootstrapAppData()
  bootstrapping.value = false
}

onMounted(boot)

// Re-bootstrap when user logs in
watch(() => auth.isLoggedIn, (loggedIn) => { if (loggedIn) boot() })
</script>

<style scoped>
.bootstrap-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: var(--color-bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1rem;
}
.bootstrap-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
