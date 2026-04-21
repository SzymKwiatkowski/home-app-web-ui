<template>
  <div class="app-layout">
    <NotificationBanner v-if="auth.isLoggedIn" />
    <router-view />
    <BottomNav v-if="auth.isLoggedIn" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'

const auth = useAuthStore()
</script>
