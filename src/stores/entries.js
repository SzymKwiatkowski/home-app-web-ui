import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const SAMPLE_DATA = [
  { id: 1, type: 'expense', name: 'Lunch at Café', amount: 28.50, expenseTypeId: 1, date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), time: '12:30', description: 'Business lunch', createdAt: Date.now() - 86400000 },
  { id: 2, type: 'expense', name: 'Groceries', amount: 74.20, expenseTypeId: 1, date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), time: '18:00', description: '', createdAt: Date.now() - 172800000 },
  { id: 3, type: 'event', name: 'Team standup', amount: null, expenseTypeId: null, date: dayjs().format('YYYY-MM-DD'), time: '09:00', description: 'Daily sync', createdAt: Date.now() - 3600000 },
  { id: 4, type: 'expense', name: 'Uber ride', amount: 12.00, expenseTypeId: 2, date: dayjs().format('YYYY-MM-DD'), time: '08:15', description: '', createdAt: Date.now() - 7200000 },
  { id: 5, type: 'event', name: 'Doctor appointment', amount: null, expenseTypeId: null, date: dayjs().add(2, 'day').format('YYYY-MM-DD'), time: '14:00', description: 'Annual checkup', createdAt: Date.now() },
  { id: 6, type: 'expense', name: 'Netflix', amount: 15.99, expenseTypeId: 5, date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), time: '00:00', description: '', createdAt: Date.now() - 432000000 },
  { id: 7, type: 'expense', name: 'Gas', amount: 55.00, expenseTypeId: 2, date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'), time: '17:30', description: '', createdAt: Date.now() - 259200000 },
  { id: 8, type: 'expense', name: 'New shoes', amount: 120.00, expenseTypeId: 3, date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'), time: '15:00', description: 'Running shoes', createdAt: Date.now() - 604800000 },
]

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref(JSON.parse(localStorage.getItem('et_entries') || JSON.stringify(SAMPLE_DATA)))

  function save() {
    localStorage.setItem('et_entries', JSON.stringify(entries.value))
  }

  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => {
      const dtA = dayjs(`${a.date} ${a.time}`)
      const dtB = dayjs(`${b.date} ${b.time}`)
      return dtB.valueOf() - dtA.valueOf()
    })
  )

  const expensesOnly = computed(() => entries.value.filter(e => e.type === 'expense'))
  const eventsOnly = computed(() => entries.value.filter(e => e.type === 'event'))

  function entriesForDate(date) {
    return entries.value.filter(e => e.date === date)
  }

  function addEntry(entry) {
    const id = Date.now()
    entries.value.push({ ...entry, id, createdAt: Date.now() })
    save()
    return id
  }

  function updateEntry(id, data) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx !== -1) { entries.value[idx] = { ...entries.value[idx], ...data }; save() }
  }

  function deleteEntry(id) {
    entries.value = entries.value.filter(e => e.id !== id)
    save()
  }

  // Stats for last month per expense type
  function getLastMonthByType(typeId) {
    const start = dayjs().subtract(30, 'day')
    return entries.value
      .filter(e => e.type === 'expense' && e.expenseTypeId === typeId && dayjs(e.date).isAfter(start))
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  }

  function getLastMonthExpenses() {
    const start = dayjs().subtract(30, 'day')
    return entries.value.filter(e => e.type === 'expense' && dayjs(e.date).isAfter(start))
  }

  return { entries, sortedEntries, expensesOnly, eventsOnly, entriesForDate, addEntry, updateEntry, deleteEntry, getLastMonthByType, getLastMonthExpenses }
})