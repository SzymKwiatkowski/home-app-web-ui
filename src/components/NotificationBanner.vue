<template>
  <Transition name="slide-down">
    <div v-if="notifications.length" class="notif-container">
      <div class="notif-header">
        <div class="notif-title">
          <span class="notif-bell">🔔</span>
          <span class="font-semibold text-sm">{{ notifications.length }} pending {{ notifications.length === 1 ? 'item' : 'items' }}</span>
        </div>
        <button class="btn btn-ghost btn-sm" @click="dismissAll">Dismiss all</button>
      </div>

      <div class="notif-list">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notif-item"
          :class="notif.severity"
        >
          <div class="notif-icon">{{ notif.type === 'income' ? '💚' : '💸' }}</div>
          <div class="notif-body">
            <div class="notif-msg text-sm font-medium">{{ notif.message }}</div>
            <div class="notif-sub text-xs text-muted">
              <span>{{ formatDate(notif.date) }}</span>
              <span v-if="notif.daysOverdue > 0"> · {{ notif.daysOverdue }}d overdue</span>
              <span v-if="notif.amount"> · {{ currencyStore.format(notif.amount, notif.currency) }}</span>
              <span v-if="assigneeName(notif.assignedUserId)"> · {{ assigneeName(notif.assignedUserId) }}</span>
            </div>
          </div>
          <div class="notif-actions">
            <button class="btn btn-ghost btn-icon btn-sm" title="Go to entry" @click="goToEntry(notif.entryId)">→</button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Dismiss" @click="notifsStore.dismiss(notif.id)">✕</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useEntriesStore } from '@/stores/entries'
import { useUsersStore } from '@/stores/users'
import { useCurrencyStore } from '@/stores/currency'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const notifsStore = useNotificationsStore()
const entriesStore = useEntriesStore()
const usersStore = useUsersStore()
const currencyStore = useCurrencyStore()
const router = useRouter()

const notifications = computed(() =>
  notifsStore.getActiveNotifications(entriesStore.entries)
)

function formatDate(date) {
  return dayjs(date).format('MMM D')
}

function assigneeName(userId) {
  if (!userId) return null
  const u = usersStore.getById(userId)
  return u ? u.name : null
}

function goToEntry(entryId) {
  router.push('/entries')
  // The entries view will open the entry — emit an event for it to handle
  // For now, navigate and the user can find it; full deep-link could be added later
}

function dismissAll() {
  notifsStore.dismissAll(notifications.value.map(n => n.id))
}
</script>

<style scoped>
.notif-container {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 90;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  max-height: 50vh;
  overflow-y: auto;
}

.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.625rem 1rem 0.375rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0;
  background: var(--color-surface);
}
.notif-title { display: flex; align-items: center; gap: 0.5rem; }
.notif-bell { font-size: 1rem; }

.notif-list { padding: 0.375rem 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }

.notif-item {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-border);
  background: var(--color-surface-2);
  transition: background var(--transition);
}
.notif-item:hover { background: var(--color-border); }
.notif-item.high { border-left-color: var(--color-danger); background: var(--color-danger-light); }
.notif-item.medium { border-left-color: var(--color-warning, #b7791f); }

.notif-icon { font-size: 1rem; flex-shrink: 0; }
.notif-body { flex: 1; min-width: 0; }
.notif-msg { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-sub { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.1rem; }
.notif-actions { display: flex; gap: 0.125rem; flex-shrink: 0; }

/* Slide down animation */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-100%); opacity: 0; }
</style>