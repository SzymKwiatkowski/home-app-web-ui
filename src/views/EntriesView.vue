<template>
  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Entries</h1>
        <p class="text-secondary text-sm">{{ totalEntries }} entries this month</p>
      </div>
      <button class="btn btn-primary" @click="openAdd()">+ Add</button>
    </div>

    <!-- Month totals strip -->
    <div class="month-strip">
      <div class="strip-item income-strip">
        <span class="strip-label text-xs">Income</span>
        <span class="strip-value">+{{ currencyStore.format(monthlyIncome) }}</span>
      </div>
      <div class="strip-divider"></div>
      <div class="strip-item expense-strip">
        <span class="strip-label text-xs">Expenses</span>
        <span class="strip-value">−{{ currencyStore.format(monthlyExpenses) }}</span>
      </div>
      <div class="strip-divider"></div>
      <div class="strip-item" :class="monthlyBalance >= 0 ? 'income-strip' : 'expense-strip'">
        <span class="strip-label text-xs">Balance</span>
        <span class="strip-value">{{ monthlyBalance >= 0 ? '+' : '' }}{{ currencyStore.format(monthlyBalance) }}</span>
      </div>
    </div>

    <!-- Filters row -->
    <div class="filters-row">
      <div class="tab-bar view-toggle">
        <button class="tab-item" :class="{ active: view === 'list' }" @click="view = 'list'">☰ List</button>
        <button class="tab-item" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">📅 Calendar</button>
      </div>
      <Transition name="fade">
        <div v-if="view === 'list'" class="type-filter">
          <button v-for="f in filters" :key="f.value" class="filter-chip" :class="{ active: activeFilter === f.value }" @click="activeFilter = f.value">
            {{ f.label }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- List view -->
    <Transition name="fade" mode="out-in">
      <div v-if="view === 'list'" key="list">
        <div v-if="filteredEntries.length" class="entries-list">
          <template v-for="(group, date) in groupedEntries" :key="date">
            <div class="date-group-label text-xs text-muted font-semibold">{{ formatGroupDate(date) }}</div>
            <div class="date-group-entries">
              <EntryCard v-for="entry in group" :key="entry.id" :entry="entry" @edit="openEdit" @delete="deleteEntry" />
            </div>
          </template>
        </div>
        <div v-else class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No entries yet</h3>
          <p class="text-sm">Start tracking your expenses, incomes and events.</p>
          <button class="btn btn-primary" style="margin-top:1rem" @click="openAdd()">Add first entry</button>
        </div>
      </div>
      <div v-else key="calendar">
        <CalendarView @edit="openEdit" @delete="deleteEntry" @add="openAdd" />
      </div>
    </Transition>

    <EntryModal v-if="showModal" :entry="editingEntry" :default-date="defaultDate" @close="closeModal" @saved="closeModal" />

    <Teleport to="body">
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal" style="max-width:360px">
          <div class="modal-header"><h3>Delete entry?</h3></div>
          <div class="modal-body"><p class="text-secondary">This action cannot be undone.</p></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="confirmDeleteId = null">Cancel</button>
            <button class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { useCurrencyStore } from '@/stores/currency'
import EntryCard from '@/components/EntryCard.vue'
import CalendarView from '@/components/CalendarView.vue'
import EntryModal from '@/components/EntryModal.vue'
import dayjs from 'dayjs'

const store = useEntriesStore()
const currencyStore = useCurrencyStore()

const view = ref('list')
const activeFilter = ref('all')
const showModal = ref(false)
const editingEntry = ref(null)
const confirmDeleteId = ref(null)
const defaultDate = ref(null)

const filters = [
  { label: 'All', value: 'all' },
  { label: '💸 Expenses', value: 'expense' },
  { label: '💚 Income', value: 'income' },
  { label: '📅 Events', value: 'event' },
]

const filteredEntries = computed(() => {
  if (activeFilter.value === 'all') return store.sortedEntries
  return store.sortedEntries.filter(e => e.type === activeFilter.value)
})

const groupedEntries = computed(() => {
  const groups = {}
  for (const e of filteredEntries.value) {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  }
  return groups
})

const thisMonth = dayjs().format('YYYY-MM')
const totalEntries = computed(() => store.entries.filter(e => e.date.startsWith(thisMonth)).length)
const monthlyExpenses = computed(() =>
  store.expensesOnly.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
)
const monthlyIncome = computed(() =>
  store.incomesOnly.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
)
const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpenses.value)

function formatGroupDate(date) {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (date === today) return 'Today'
  if (date === yesterday) return 'Yesterday'
  return dayjs(date).format('dddd, MMMM D')
}

function openAdd(date = null) { editingEntry.value = null; defaultDate.value = date; showModal.value = true }
function openEdit(entry) { editingEntry.value = entry; showModal.value = true }
function closeModal() { showModal.value = false; editingEntry.value = null; defaultDate.value = null }
function deleteEntry(id) { confirmDeleteId.value = id }
function confirmDelete() { store.deleteEntry(confirmDeleteId.value); confirmDeleteId.value = null }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; }
.page-header h1 { margin-bottom: 0.2rem; }

.month-strip {
  display: flex; align-items: stretch;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1.25rem;
}
.strip-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0.75rem 0.5rem; gap: 0.2rem; }
.strip-label { text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.strip-value { font-weight: 700; font-size: 0.9375rem; }
.income-strip .strip-value { color: var(--color-accent); }
.expense-strip .strip-value { color: var(--color-expense); }
.strip-divider { width: 1px; background: var(--color-border); flex-shrink: 0; }

.filters-row { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
.view-toggle { max-width: 220px; }
.type-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-chip {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.8125rem; font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer; background: var(--color-surface);
  transition: all var(--transition);
}
.filter-chip:hover { border-color: var(--color-border-strong); color: var(--color-text); }
.filter-chip.active { background: var(--color-text); border-color: var(--color-text); color: var(--color-bg); }

.entries-list { display: flex; flex-direction: column; gap: 1.25rem; }
.date-group-label { text-transform: uppercase; letter-spacing: 0.06em; padding: 0 0.125rem; margin-bottom: 0.5rem; }
.date-group-entries { display: flex; flex-direction: column; gap: 0.5rem; }
</style>
