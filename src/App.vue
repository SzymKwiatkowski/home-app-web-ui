<template>
  <div class="app-layout">
    <router-view />
    <BottomNav
      v-if="auth.isLoggedIn"
      @open-notifications="notifPanelOpen = true"
    />
    <NotificationPanel
      v-if="auth.isLoggedIn"
      v-model="notifPanelOpen"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'

const auth = useAuthStore()
const notifPanelOpen = ref(false)
</script>