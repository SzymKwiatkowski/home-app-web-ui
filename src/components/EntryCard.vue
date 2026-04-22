<template>
  <div class="entry-card card-flat" :class="[entry.type, { completed: entry.completed, highlighted: highlighted }]">
    <!-- Completion checkbox -->
    <button
      v-if="entry.type !== 'event' || true"
      class="complete-btn"
      :class="{ done: entry.completed }"
      :title="completionLabel"
      @click.stop="entriesStore.toggleComplete(entry.id)"
    >
      <span class="complete-circle">
        <span v-if="entry.completed" class="complete-check">✓</span>
      </span>
    </button>

    <div class="entry-left">
      <div class="entry-icon" :style="iconStyle">{{ entryIcon }}</div>
      <div class="entry-info">
        <div class="entry-name" :class="{ 'line-through': entry.completed }">{{ entry.name }}</div>
        <div class="entry-meta text-xs text-muted">
          <span>{{ formattedDate }}</span>
          <span class="dot">·</span>
          <span :class="['badge', badgeClass]">{{ badgeLabel }}</span>
          <template v-if="entry.completed">
            <span class="dot">·</span>
            <span class="completed-label">{{ completedVerb }}</span>
          </template>
        </div>
        <!-- Assigned users -->
        <div v-if="assignedUsers.length" class="entry-users">
          <span
            v-for="user in assignedUsers"
            :key="user.id"
            class="user-avatar-xs"
            :style="{ background: user.color }"
            :title="user.name"
          >{{ user.name[0].toUpperCase() }}</span>
        </div>
        <div v-if="entry.description" class="entry-desc text-sm text-secondary">{{ entry.description }}</div>
      </div>
    </div>

    <div class="entry-right">
      <div v-if="entry.type === 'expense'" class="entry-amount expense">
        −{{ currencyStore.format(entry.amount, entry.currency) }}
      </div>
      <div v-else-if="entry.type === 'income'" class="entry-amount income">
        +{{ currencyStore.format(entry.amount, entry.currency) }}
      </div>
      <div class="entry-actions">
        <button class="btn btn-ghost btn-icon btn-sm" @click="$emit('edit', entry)" title="Edit">✏️</button>
        <button class="btn btn-ghost btn-icon btn-sm" @click="$emit('delete', entry.id)" title="Delete">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useExpenseTypesStore } from '@/stores/expenseTypes'
import { useCurrencyStore } from '@/stores/currency'
import { useUsersStore } from '@/stores/users'
import { useEntriesStore } from '@/stores/entries'
import dayjs from 'dayjs'

const props = defineProps({ entry: Object, highlighted: { type: Boolean, default: false } })
defineEmits(['edit', 'delete'])

const typesStore = useExpenseTypesStore()
const currencyStore = useCurrencyStore()
const usersStore = useUsersStore()
const entriesStore = useEntriesStore()

const typeObj = computed(() => props.entry.expenseTypeId ? typesStore.getById(props.entry.expenseTypeId) : null)

const entryIcon = computed(() => {
  if (props.entry.type === 'event') return '📅'
  if (props.entry.type === 'income') return '💚'
  return typeObj.value?.icon || '💸'
})

const iconStyle = computed(() => {
  if (props.entry.completed) return { background: 'var(--color-surface-2)', opacity: '0.7' }
  if (props.entry.type === 'income') return { background: 'var(--color-accent-light)' }
  if (props.entry.type === 'event') return { background: 'var(--color-surface-2)' }
  return { background: (typeObj.value?.color || '#888') + '18' }
})

const badgeClass = computed(() => ({
  expense: 'badge-expense', income: 'badge-income', event: 'badge-event',
}[props.entry.type]))

const badgeLabel = computed(() => {
  if (props.entry.type === 'income') return 'Income'
  if (props.entry.type === 'event') return 'Event'
  return typeObj.value?.name || 'Uncategorized'
})

const completionLabel = computed(() => {
  if (props.entry.type === 'expense') return props.entry.completed ? 'Mark as unpaid' : 'Mark as paid'
  if (props.entry.type === 'income') return props.entry.completed ? 'Mark as not received' : 'Mark as received'
  return props.entry.completed ? 'Mark as incomplete' : 'Mark as completed'
})

const completedVerb = computed(() => {
  if (props.entry.type === 'expense') return 'Paid ✓'
  if (props.entry.type === 'income') return 'Received ✓'
  return 'Done ✓'
})

const formattedDate = computed(() => {
  const d = dayjs(`${props.entry.date} ${props.entry.time}`)
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (props.entry.date === today) return `Today, ${d.format('HH:mm')}`
  if (props.entry.date === yesterday) return `Yesterday, ${d.format('HH:mm')}`
  return d.format('MMM D, HH:mm')
})

const assignedUsers = computed(() => {
  const ids = props.entry.assignedUserIds || (props.entry.assignedUserId ? [props.entry.assignedUserId] : [])
  return ids.map(id => usersStore.getById(id)).filter(Boolean)
})
</script>

<style scoped>
.entry-card {
  display: flex; align-items: flex-start; gap: 0.625rem;
  transition: box-shadow var(--transition), opacity var(--transition);
}
.entry-card:hover { box-shadow: var(--shadow-sm); }
.entry-card.completed { opacity: 0.65; }
.entry-card.completed:hover { opacity: 1; }

/* Completion button */
.complete-btn {
  flex-shrink: 0; padding: 0; background: none; border: none;
  cursor: pointer; margin-top: 0.125rem;
}
.complete-circle {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition); background: var(--color-surface);
}
.complete-btn:hover .complete-circle { border-color: var(--color-accent); }
.complete-btn.done .complete-circle { background: var(--color-accent); border-color: var(--color-accent); }
.complete-check { color: white; font-size: 0.65rem; font-weight: 700; line-height: 1; }

.entry-left { display: flex; align-items: flex-start; gap: 0.625rem; flex: 1; min-width: 0; }
.entry-icon { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; transition: all var(--transition); }
.entry-info { flex: 1; min-width: 0; }
.entry-name { font-weight: 500; font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: text-decoration var(--transition); }
.entry-name.line-through { text-decoration: line-through; color: var(--color-text-muted); }
.entry-meta { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.1rem; flex-wrap: wrap; }
.dot { color: var(--color-border-strong); }
.completed-label { color: var(--color-accent); font-weight: 500; }
.entry-users { display: flex; gap: 0.25rem; margin-top: 0.3rem; flex-wrap: wrap; }
.user-avatar-xs {
  width: 18px; height: 18px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: white;
}
.entry-desc { margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8125rem; }
.entry-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
.entry-amount { font-weight: 600; font-size: 0.9375rem; }
.entry-amount.expense { color: var(--color-expense); }
.entry-amount.income  { color: var(--color-accent); }
.entry-actions { display: flex; gap: 0.125rem; opacity: 0; transition: opacity var(--transition); }
.entry-card:hover .entry-actions { opacity: 1; }
.badge-income { background: var(--color-accent-light); color: var(--color-accent); }
.entry-card.highlighted {
  animation: highlight-flash 3s ease forwards;
}
@keyframes highlight-flash {
  0%   { box-shadow: 0 0 0 3px var(--color-accent); background: var(--color-accent-light); }
  60%  { box-shadow: 0 0 0 3px var(--color-accent); background: var(--color-accent-light); }
  100% { box-shadow: none; background: transparent; }
}
</style>