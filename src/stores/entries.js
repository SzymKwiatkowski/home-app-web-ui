import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const SAMPLE_DATA = [
  { id: 1, type: 'expense', name: 'Lunch at Café', amount: 38.50, currency: 'PLN', expenseTypeId: 1, date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), time: '12:30', description: 'Business lunch', assignedUserId: 1, createdAt: Date.now() - 86400000 },
  { id: 2, type: 'expense', name: 'Groceries', amount: 142.20, currency: 'PLN', expenseTypeId: 1, date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), time: '18:00', description: '', assignedUserId: 1, createdAt: Date.now() - 172800000 },
  { id: 3, type: 'event', name: 'Team standup', amount: null, currency: null, expenseTypeId: null, date: dayjs().format('YYYY-MM-DD'), time: '09:00', description: 'Daily sync', assignedUserId: 1, createdAt: Date.now() - 3600000 },
  { id: 4, type: 'expense', name: 'Uber ride', amount: 28.00, currency: 'PLN', expenseTypeId: 2, date: dayjs().format('YYYY-MM-DD'), time: '08:15', description: '', assignedUserId: 1, createdAt: Date.now() - 7200000 },
  { id: 5, type: 'event', name: 'Doctor appointment', amount: null, currency: null, expenseTypeId: null, date: dayjs().add(2, 'day').format('YYYY-MM-DD'), time: '14:00', description: 'Annual checkup', assignedUserId: 1, createdAt: Date.now() },
  { id: 6, type: 'expense', name: 'Netflix', amount: 65.00, currency: 'PLN', expenseTypeId: 5, date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), time: '00:00', description: '', assignedUserId: 1, createdAt: Date.now() - 432000000 },
  { id: 7, type: 'expense', name: 'Gas', amount: 220.00, currency: 'PLN', expenseTypeId: 2, date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'), time: '17:30', description: '', assignedUserId: 1, createdAt: Date.now() - 259200000 },
  { id: 8, type: 'expense', name: 'New shoes', amount: 280.00, currency: 'PLN', expenseTypeId: 3, date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'), time: '15:00', description: 'Running shoes', assignedUserId: 1, createdAt: Date.now() - 604800000 },
  { id: 9, type: 'income', name: 'Monthly salary', amount: 8500.00, currency: 'PLN', expenseTypeId: null, date: dayjs().startOf('month').format('YYYY-MM-DD'), time: '08:00', description: 'Net salary', assignedUserId: 1, createdAt: Date.now() - 864000000 },
  { id: 10, type: 'income', name: 'Freelance project', amount: 2200.00, currency: 'PLN', expenseTypeId: null, date: dayjs().subtract(10, 'day').format('YYYY-MM-DD'), time: '10:00', description: 'Web design project', assignedUserId: 1, createdAt: Date.now() - 864000000 },
  { id: 11, type: 'income', name: 'Monthly salary', amount: 8500.00, currency: 'PLN', expenseTypeId: null, date: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), time: '08:00', description: 'Net salary', assignedUserId: 1, createdAt: Date.now() - 2592000000 },
  { id: 12, type: 'expense', name: 'Electricity bill', amount: 185.40, currency: 'PLN', expenseTypeId: 6, date: dayjs().subtract(1, 'month').add(5, 'day').format('YYYY-MM-DD'), time: '10:00', description: '', assignedUserId: 1, createdAt: Date.now() - 2592000000 },
  { id: 13, type: 'expense', name: 'Groceries', amount: 380.00, currency: 'PLN', expenseTypeId: 1, date: dayjs().subtract(1, 'month').add(8, 'day').format('YYYY-MM-DD'), time: '17:00', description: '', assignedUserId: 1, createdAt: Date.now() - 2332800000 },
]

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref(JSON.parse(localStorage.getItem('et_entries') || JSON.stringify(SAMPLE_DATA)))

  function save() { localStorage.setItem('et_entries', JSON.stringify(entries.value)) }

  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => dayjs(b.date + ' ' + b.time).valueOf() - dayjs(a.date + ' ' + a.time).valueOf())
  )

  const expensesOnly = computed(() => entries.value.filter(e => e.type === 'expense'))
  const incomesOnly  = computed(() => entries.value.filter(e => e.type === 'income'))
  const eventsOnly   = computed(() => entries.value.filter(e => e.type === 'event'))

  function entriesForDate(date) { return entries.value.filter(e => e.date === date) }

  function addEntry(entry) {
    const id = Date.now()
    entries.value.push({ ...entry, id, createdAt: Date.now() })
    save(); return id
  }

  function updateEntry(id, data) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx !== -1) { entries.value[idx] = { ...entries.value[idx], ...data }; save() }
  }

  function deleteEntry(id) { entries.value = entries.value.filter(e => e.id !== id); save() }

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

  function getEntriesForMonth(yearMonth) {
    return entries.value.filter(e => e.date.startsWith(yearMonth))
  }

  function getMonthlySummary(yearMonth) {
    const all = getEntriesForMonth(yearMonth)
    const expenses = all.filter(e => e.type === 'expense')
    const incomes  = all.filter(e => e.type === 'income')
    const events   = all.filter(e => e.type === 'event')
    const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    const totalIncomes  = incomes.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    return { yearMonth, expenses, incomes, events, totalExpenses, totalIncomes, balance: totalIncomes - totalExpenses }
  }

  function getAvailableMonths() {
    const months = new Set(entries.value.map(e => e.date.slice(0, 7)))
    return [...months].sort().reverse()
  }

  return {
    entries, sortedEntries,
    expensesOnly, incomesOnly, eventsOnly,
    entriesForDate, addEntry, updateEntry, deleteEntry,
    getLastMonthByType, getLastMonthExpenses,
    getEntriesForMonth, getMonthlySummary, getAvailableMonths,
  }
})