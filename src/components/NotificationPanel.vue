<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="modelValue" class="notif-backdrop" @click="$emit('update:modelValue', false)" />
    </Transition>

    <!-- Panel -->
    <Transition name="slide-up-panel">
      <div v-if="modelValue" class="notif-panel">

        <!-- Handle bar -->
        <div class="panel-handle-wrap" @click="$emit('update:modelValue', false)">
          <div class="panel-handle" />
        </div>

        <!-- Header -->
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-bell-icon">🔔</span>
            <h2>Notifications</h2>
            <span v-if="notifsStore.count" class="notif-count-badge">{{ notifsStore.count }}</span>
          </div>
          <button class="btn btn-ghost btn-icon" @click="$emit('update:modelValue', false)">✕</button>
        </div>

        <!-- Empty state -->
        <div v-if="!notifsStore.notifications.length" class="panel-empty">
          <div class="empty-icon">✅</div>
          <h3>All clear!</h3>
          <p class="text-sm text-secondary">No overdue or unpaid entries.</p>
        </div>

        <!-- Notification list -->
        <div v-else class="panel-list">
          <div
            v-for="notif in notifsStore.notifications"
            :key="notif.id"
            class="notif-row"
            :class="[notif.severity, notif.type]"
            @click="goToEntry(notif)"
          >
            <!-- Left accent + icon -->
            <div class="notif-row-icon">
              <span>{{ notif.type === 'income' ? '💚' : '💸' }}</span>
            </div>

            <!-- Body -->
            <div class="notif-row-body">
              <div class="notif-row-name font-medium">{{ notif.name }}</div>
              <div class="notif-row-meta text-xs">
                <span :class="notif.severity === 'high' ? 'overdue-high' : 'overdue-medium'">
                  {{ overdueLabel(notif.daysOverdue) }}
                </span>
                <span class="meta-dot">·</span>
                <span class="text-muted">{{ formatDate(notif.date) }}</span>
                <template v-if="notif.amount">
                  <span class="meta-dot">·</span>
                  <span class="text-muted">{{ currencyStore.format(notif.amount, notif.currency) }}</span>
                </template>
              </div>
              <!-- Assigned users -->
              <div v-if="assignedUsers(notif).length" class="notif-row-users">
                <span
                  v-for="u in assignedUsers(notif)"
                  :key="u.id"
                  class="user-avatar-xs"
                  :style="{ background: u.color }"
                  :title="u.name"
                >{{ u.name[0].toUpperCase() }}</span>
              </div>
            </div>

            <!-- Right: action hint -->
            <div class="notif-row-action">
              <span class="goto-arrow">›</span>
            </div>
          </div>
        </div>

        <!-- Footer hint -->
        <div v-if="notifsStore.notifications.length" class="panel-footer">
          <span class="text-xs text-muted">
            Notifications clear automatically once entries are marked complete.
          </span>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useCurrencyStore } from '@/stores/currency'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])

const notifsStore = useNotificationsStore()
const currencyStore = useCurrencyStore()
const usersStore = useUsersStore()
const router = useRouter()

function formatDate(date) {
  const d = dayjs(date)
  const today = dayjs().format('YYYY-MM-DD')
  if (date === today) return 'Today'
  return d.format('MMM D, YYYY')
}

function overdueLabel(days) {
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day overdue'
  return `${days} days overdue`
}

function assignedUsers(notif) {
  return (notif.assignedUserIds || [])
    .map(id => usersStore.getById(id))
    .filter(Boolean)
}

function goToEntry(notif) {
  emit('update:modelValue', false)
  // Navigate to entries with a query param so the view can highlight the entry
  router.push({ path: '/entries', query: { highlight: notif.entryId } })
}
</script>

<style scoped>
.notif-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 200;
}

.notif-panel {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 201;
  background: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow: var(--shadow-lg);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Respect bottom nav height */
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}

/* Handle */
.panel-handle-wrap { display: flex; justify-content: center; padding: 0.625rem 0 0; cursor: pointer; }
.panel-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--color-border-strong); }

/* Header */
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.25rem 0.625rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.panel-title { display: flex; align-items: center; gap: 0.625rem; }
.panel-bell-icon { font-size: 1.25rem; }
.panel-title h2 { font-size: 1.125rem; }
.notif-count-badge {
  background: var(--color-danger); color: white;
  border-radius: 999px; font-size: 0.7rem; font-weight: 700;
  min-width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 0.3rem;
}

/* Empty */
.panel-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 3rem 1.5rem; text-align: center; gap: 0.5rem;
}
.empty-icon { font-size: 3rem; margin-bottom: 0.25rem; }

/* List */
.panel-list { flex: 1; overflow-y: auto; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.375rem; }

.notif-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-border);
  background: var(--color-surface-2);
  cursor: pointer;
  transition: background var(--transition), transform var(--transition);
}
.notif-row:hover { background: var(--color-border); transform: translateX(2px); }
.notif-row:active { transform: translateX(4px); }
.notif-row.high { border-left-color: var(--color-danger); background: var(--color-danger-light); }
.notif-row.medium { border-left-color: var(--color-warning, #b7791f); }
.notif-row.income.high { border-left-color: var(--color-accent); background: var(--color-accent-light); }
.notif-row.income.medium { border-left-color: var(--color-accent); }

.notif-row-icon { font-size: 1.25rem; flex-shrink: 0; }
.notif-row-body { flex: 1; min-width: 0; }
.notif-row-name { font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-row-meta { display: flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem; flex-wrap: wrap; }
.meta-dot { color: var(--color-border-strong); }
.overdue-high { color: var(--color-danger); font-weight: 600; }
.overdue-medium { color: var(--color-warning, #b7791f); font-weight: 600; }

.notif-row-users { display: flex; gap: 0.2rem; margin-top: 0.3rem; }
.user-avatar-xs {
  width: 16px; height: 16px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.55rem; font-weight: 700; color: white;
}

.notif-row-action { flex-shrink: 0; }
.goto-arrow { font-size: 1.25rem; color: var(--color-text-muted); font-weight: 300; }

.panel-footer {
  padding: 0.625rem 1.25rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  flex-shrink: 0;
}

/* Transitions */
.slide-up-panel-enter-active, .slide-up-panel-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-panel-enter-from, .slide-up-panel-leave-to { transform: translateY(100%); }
</style>