<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.to) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/entries',       icon: '📋', label: 'Entries' },
  { to: '/expense-types', icon: '📊', label: 'Categories' },
  { to: '/scheduled',     icon: '⏰', label: 'Scheduled' },
  { to: '/summaries',     icon: '📈', label: 'Summaries' },
  { to: '/profile',       icon: '👤', label: 'Profile' },
]

function isActive(path) {
  return route.path === path
}
</script>
