<template>
  <nav class="bottom-nav">
    <!-- Regular nav tabs -->
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.to) }"
    >
      <span class="nav-icon" v-html="item.icon"></span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>

    <!-- Bell button — not a route, opens the notification panel -->
    <button
      class="nav-item nav-bell"
      :class="{ 'has-notifs': notifCount > 0 }"
      @click="$emit('open-notifications')"
      aria-label="Notifications"
    >
      <span class="nav-icon bell-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span v-if="notifCount > 0" class="bell-badge">{{ notifCount > 9 ? '9+' : notifCount }}</span>
      </span>
      <span class="nav-label">Alerts</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'

defineEmits(['open-notifications'])

const route = useRoute()
const notifsStore = useNotificationsStore()
const notifCount = computed(() => notifsStore.count)

const navItems = [
  {
    to: '/entries', label: 'Entries',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
  },
  {
    to: '/expense-types', label: 'Categories',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="9" height="9" rx="1"/><rect x="13" y="3" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>`
  },
  {
    to: '/scheduled', label: 'Scheduled',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    to: '/summaries', label: 'Summaries',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
  },
  {
    to: '/profile', label: 'Profile',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
]

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
/* Bell badge */
.bell-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.bell-badge {
  position: absolute;
  top: -5px; right: -6px;
  background: var(--color-danger);
  color: white;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 0.2rem;
  border: 2px solid var(--color-surface);
  line-height: 1;
}

/* Bell pulse when there are notifications */
.nav-bell.has-notifs .bell-wrap svg {
  animation: bell-ring 3s ease-in-out infinite;
  transform-origin: 12px 4px;
}
@keyframes bell-ring {
  0%, 85%, 100% { transform: rotate(0deg); }
  88%  { transform: rotate(12deg); }
  92%  { transform: rotate(-10deg); }
  96%  { transform: rotate(6deg); }
  98%  { transform: rotate(-4deg); }
}

/* Active bell gets accent color */
.nav-bell.has-notifs { color: var(--color-danger); }
</style>