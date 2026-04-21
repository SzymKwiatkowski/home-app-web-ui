<template>
  <div class="main-content">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Entries</h1>
        <p class="text-secondary text-sm">{{ totalEntries }} total · ${{ totalSpent }} this month</p>
      </div>
      <button class="btn btn-primary" @click="openAdd()">+ Add</button>
    </div>

    <!-- Filters row -->
    <div class="filters-row">
      <!-- View toggle -->
      <div class="tab-bar view-toggle">
        <button class="tab-item" :class="{ active: view === 'list' }" @click="view = 'list'">
          ☰ List
        </button>
        <button class="tab-item" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">
          📅 Calendar
        </button>
      </div>

      <!-- Type filter (list only) -->
      <Transition name="fade">
        <div v-if="view === 'list'" class="type-filter">
          <button
            v-for="f in filters"
            :key="f.value"
            class="filter-chip"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
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
            <div class="date-group-label text-xs text-muted font-semibold">
              {{ formatGroupDate(date) }}
            </div>
            <div class="date-group-entries">
              <EntryCard
                v-for="entry in group"
                :key="entry.id"
                :entry="entry"
                @edit="openEdit"
                @delete="deleteEntry"
              />
            </div>
          </template>
        </div>
        <div v-else class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No entries yet</h3>
          <p class="text-sm">Start tracking your expenses and events.</p>
          <button class="btn btn-primary" style="margin-top:1rem" @click="openAdd()">Add first entry</button>
        </div>
      </div>

      <!-- Calendar view -->
      <div v-else key="calendar">
        <CalendarView @edit="openEdit" @delete="deleteEntry" @add="openAdd" />
      </div>
    </Transition>

    <!-- Add/Edit modal -->
    <EntryModal
      v-if="showModal"
      :entry="editingEntry"
      :default-date="defaultDate"
      @close="closeModal"
      @saved="closeModal"
    />

    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal" style="max-width:360px">
          <div class="modal-header">
            <h3>Delete entry?</h3>
          </div>
          <div class="modal-body">
            <p class="text-secondary">This action cannot be undone.</p>
          </div>
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
import EntryCard from '@/components/EntryCard.vue'
import CalendarView from '@/components/CalendarView.vue'
import EntryModal from '@/components/EntryModal.vue'
import dayjs from 'dayjs'

const store = useEntriesStore()

const view = ref('list')
const activeFilter = ref('all')
const showModal = ref(false)
const editingEntry = ref(null)
const confirmDeleteId = ref(null)
const defaultDate = ref(null)

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Expenses', value: 'expense' },
  { label: 'Events', value: 'event' },
]

const filteredEntries = computed(() => {
  const entries = store.sortedEntries
  if (activeFilter.value === 'all') return entries
  return entries.filter(e => e.type === activeFilter.value)
})

const groupedEntries = computed(() => {
  const groups = {}
  for (const e of filteredEntries.value) {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  }
  return groups
})

const totalEntries = computed(() => store.entries.length)
const totalSpent = computed(() => {
  const start = dayjs().startOf('month')
  return store.expensesOnly
    .filter(e => dayjs(e.date).isAfter(start.subtract(1, 'day')))
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    .toFixed(2)
})

function formatGroupDate(date) {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (date === today) return 'Today'
  if (date === yesterday) return 'Yesterday'
  return dayjs(date).format('dddd, MMMM D')
}

function openAdd(date = null) {
  editingEntry.value = null
  defaultDate.value = date
  showModal.value = true
}

function openEdit(entry) {
  editingEntry.value = entry
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingEntry.value = null
  defaultDate.value = null
}

function deleteEntry(id) {
  confirmDeleteId.value = id
}

function confirmDelete() {
  store.deleteEntry(confirmDeleteId.value)
  confirmDeleteId.value = null
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.page-header h1 { margin-bottom: 0.25rem; }
.filters-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.view-toggle { max-width: 220px; }
.type-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-chip {
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: var(--color-surface);
  transition: all var(--transition);
}
.filter-chip:hover { border-color: var(--color-border-strong); color: var(--color-text); }
.filter-chip.active {
  background: var(--color-text);
  border-color: var(--color-text);
  color: var(--color-bg);
}
.entries-list { display: flex; flex-direction: column; gap: 1.25rem; }
.date-group-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 0.125rem;
  margin-bottom: 0.5rem;
}
.date-group-entries { display: flex; flex-direction: column; gap: 0.5rem; }
</style>