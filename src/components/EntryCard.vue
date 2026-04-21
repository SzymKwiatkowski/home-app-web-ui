<template>
  <div class="entry-card card-flat" :class="entry.type">
    <div class="entry-left">
      <div class="entry-icon" :style="iconStyle">{{ entryIcon }}</div>
      <div class="entry-info">
        <div class="entry-name">{{ entry.name }}</div>
        <div class="entry-meta text-xs text-muted">
          <span>{{ formattedDate }}</span>
          <span class="dot">·</span>
          <span :class="['badge', badgeClass]">{{ badgeLabel }}</span>
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
        <button class="btn btn-ghost btn-icon btn-sm" @click="$emit('edit', entry)">✏️</button>
        <button class="btn btn-ghost btn-icon btn-sm" @click="$emit('delete', entry.id)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useExpenseTypesStore } from '@/stores/expenseTypes'
import { useCurrencyStore } from '@/stores/currency'
import dayjs from 'dayjs'

const props = defineProps({ entry: Object })
defineEmits(['edit', 'delete'])

const typesStore = useExpenseTypesStore()
const currencyStore = useCurrencyStore()

const typeObj = computed(() => props.entry.expenseTypeId ? typesStore.getById(props.entry.expenseTypeId) : null)

const entryIcon = computed(() => {
  if (props.entry.type === 'event') return '📅'
  if (props.entry.type === 'income') return '💚'
  return typeObj.value?.icon || '💸'
})

const iconStyle = computed(() => {
  if (props.entry.type === 'income') return { background: 'var(--color-accent-light)' }
  if (props.entry.type === 'event') return { background: 'var(--color-surface-2)' }
  return { background: (typeObj.value?.color || '#888') + '18' }
})

const badgeClass = computed(() => ({
  expense: 'badge-expense',
  income: 'badge-income',
  event: 'badge-event',
}[props.entry.type]))

const badgeLabel = computed(() => {
  if (props.entry.type === 'income') return 'Income'
  if (props.entry.type === 'event') return 'Event'
  return typeObj.value?.name || 'Uncategorized'
})

const formattedDate = computed(() => {
  const d = dayjs(`${props.entry.date} ${props.entry.time}`)
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (props.entry.date === today) return `Today, ${d.format('HH:mm')}`
  if (props.entry.date === yesterday) return `Yesterday, ${d.format('HH:mm')}`
  return d.format('MMM D, HH:mm')
})
</script>

<style scoped>
.entry-card { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; transition: box-shadow var(--transition); }
.entry-card:hover { box-shadow: var(--shadow-sm); }
.entry-left { display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 0; }
.entry-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.entry-info { flex: 1; min-width: 0; }
.entry-name { font-weight: 500; font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.entry-meta { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.125rem; flex-wrap: wrap; }
.dot { color: var(--color-border-strong); }
.entry-desc { margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.entry-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
.entry-amount { font-weight: 600; font-size: 0.9375rem; }
.entry-amount.expense { color: var(--color-expense); }
.entry-amount.income  { color: var(--color-accent); }
.entry-actions { display: flex; gap: 0.125rem; opacity: 0; transition: opacity var(--transition); }
.entry-card:hover .entry-actions { opacity: 1; }
.badge-income { background: var(--color-accent-light); color: var(--color-accent); }
</style>
