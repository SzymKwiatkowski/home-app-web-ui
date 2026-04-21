<template>
  <div class="app-layout">
    <router-view />
    <BottomNav v-if="auth.isLoggedIn" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'

const auth = useAuthStore()
</script>