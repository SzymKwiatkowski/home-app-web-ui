<template>
  <div class="calendar-wrapper">
    <!-- Month nav -->
    <div class="cal-header">
      <button class="btn btn-ghost btn-icon" @click="prevMonth">‹</button>
      <span class="cal-title">{{ dayjs(current).format('MMMM YYYY') }}</span>
      <button class="btn btn-ghost btn-icon" @click="nextMonth">›</button>
    </div>

    <!-- Day headers -->
    <div class="cal-grid-head">
      <div v-for="d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="d" class="cal-day-name">{{ d }}</div>
    </div>

    <!-- Days grid -->
    <div class="cal-grid">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="cal-cell"
        :class="{
          'other-month': !cell.isCurrentMonth,
          'today': cell.isToday,
          'selected': selectedDate === cell.date,
          'has-entries': cell.entries.length > 0
        }"
        @click="selectDate(cell)"
      >
        <span class="cal-date-num">{{ cell.day }}</span>
        <div class="cal-dots">
          <span v-if="cell.expenseCount" class="cal-dot expense-dot" :title="`${cell.expenseCount} expense(s)`"></span>
          <span v-if="cell.eventCount" class="cal-dot event-dot" :title="`${cell.eventCount} event(s)`"></span>
        </div>
      </div>
    </div>

    <!-- Selected day entries -->
    <Transition name="slide-up">
      <div v-if="selectedDate && selectedEntries.length" class="day-entries">
        <div class="day-entries-header">
          <span class="font-semibold">{{ dayjs(selectedDate).format('MMMM D') }}</span>
          <span class="badge badge-neutral">{{ selectedEntries.length }} {{ selectedEntries.length === 1 ? 'entry' : 'entries' }}</span>
        </div>
        <div class="day-entries-list">
          <EntryCard
            v-for="entry in selectedEntries"
            :key="entry.id"
            :entry="entry"
            @edit="$emit('edit', entry)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </div>
      <div v-else-if="selectedDate" class="day-empty text-muted text-sm">
        No entries for {{ dayjs(selectedDate).format('MMMM D') }}.
        <button class="btn btn-ghost btn-sm text-accent" @click="$emit('add', selectedDate)">+ Add one</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useEntriesStore } from '@/stores/entries'
import EntryCard from '@/components/EntryCard.vue'

const emit = defineEmits(['edit', 'delete', 'add'])

const store = useEntriesStore()
const current = ref(dayjs().startOf('month'))
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const today = dayjs().format('YYYY-MM-DD')

function prevMonth() { current.value = current.value.subtract(1, 'month') }
function nextMonth() { current.value = current.value.add(1, 'month') }

const cells = computed(() => {
  const start = current.value.startOf('month')
  const end = current.value.endOf('month')
  // pad to Monday
  let startPad = start.day() === 0 ? 6 : start.day() - 1
  const days = []

  for (let i = startPad; i > 0; i--) {
    const d = start.subtract(i, 'day')
    days.push(makeCell(d, false))
  }
  for (let d = start; !d.isAfter(end); d = d.add(1, 'day')) {
    days.push(makeCell(d, true))
  }
  // fill to complete rows
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(makeCell(end.add(i, 'day'), false))
    }
  }
  return days
})

function makeCell(d, isCurrentMonth) {
  const date = d.format('YYYY-MM-DD')
  const entries = store.entriesForDate(date)
  return {
    key: date,
    date,
    day: d.date(),
    isCurrentMonth,
    isToday: date === today,
    entries,
    expenseCount: entries.filter(e => e.type === 'expense').length,
    eventCount: entries.filter(e => e.type === 'event').length,
  }
}

const selectedEntries = computed(() => {
  if (!selectedDate.value) return []
  return store.entriesForDate(selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

function selectDate(cell) {
  selectedDate.value = selectedDate.value === cell.date ? null : cell.date
}
</script>

<style scoped>
.calendar-wrapper { display: flex; flex-direction: column; gap: 1rem; }
.cal-header { display: flex; align-items: center; justify-content: space-between; padding: 0 0.25rem; }
.cal-title { font-weight: 600; font-size: 1rem; }
.cal-grid-head {
  display: grid; grid-template-columns: repeat(7, 1fr);
  text-align: center;
}
.cal-day-name { font-size: 0.75rem; font-weight: 500; color: var(--color-text-muted); padding: 0.25rem 0; }
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.cal-cell {
  min-height: 60px;
  padding: 0.375rem;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transition: background var(--transition);
  position: relative;
}
.cal-cell:nth-child(7n) { border-right: none; }
.cal-cell:hover { background: var(--color-surface-2); }
.cal-cell.other-month .cal-date-num { color: var(--color-text-muted); }
.cal-cell.today .cal-date-num {
  background: var(--color-text); color: var(--color-bg);
  border-radius: 999px; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
}
.cal-cell.selected { background: var(--color-accent-light); }
.cal-date-num { font-size: 0.8rem; font-weight: 500; line-height: 1; }
.cal-dots { display: flex; gap: 3px; margin-top: auto; }
.cal-dot { width: 6px; height: 6px; border-radius: 50%; }
.expense-dot { background: var(--color-expense); }
.event-dot { background: var(--color-event); }

.day-entries { display: flex; flex-direction: column; gap: 0.75rem; }
.day-entries-header { display: flex; align-items: center; gap: 0.75rem; padding: 0 0.25rem; }
.day-entries-list { display: flex; flex-direction: column; gap: 0.5rem; }
.day-empty { padding: 1rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
</style>