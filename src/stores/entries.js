import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { entriesApi } from '@/api/adapters'
import dayjs from 'dayjs'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref([])
  const loading = ref(false)
  const error   = ref(null)
  const loaded  = ref(false)

  // ── Fetch ────────────────────────────────────────────────────────
  async function fetchAll(params) {
    loading.value = true
    error.value   = null
    try {
      entries.value = await entriesApi.getAll(params)
      loaded.value  = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── Computed ─────────────────────────────────────────────────────
  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) =>
      dayjs(b.date + ' ' + b.time).valueOf() - dayjs(a.date + ' ' + a.time).valueOf()
    )
  )

  const expensesOnly = computed(() => entries.value.filter(e => e.type === 'expense'))
  const incomesOnly  = computed(() => entries.value.filter(e => e.type === 'income'))
  const eventsOnly   = computed(() => entries.value.filter(e => e.type === 'event'))

  function entriesForDate(date) {
    return entries.value.filter(e => e.date === date)
  }

  // ── Create ───────────────────────────────────────────────────────
  async function addEntry(entry) {
    loading.value = true
    error.value   = null
    try {
      const id = await entriesApi.create(entry)   // returns UUID string
      const newEntry = {
        ...entry,
        id,
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
      }
      entries.value.push(newEntry)
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // ── Update (optimistic — API has no PUT /entries/:id yet) ────────
  function updateEntry(id, data) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      entries.value[idx] = { ...entries.value[idx], ...data }
    }
  }

  // ── Delete (optimistic — API has no DELETE /entries/:id yet) ─────
  function deleteEntry(id) {
    entries.value = entries.value.filter(e => e.id !== id)
  }

  // ── Toggle complete — calls PUT /api/entries/{id}/toggle ─────────
  async function toggleComplete(id) {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx === -1) return
    // Optimistic update
    const current = entries.value[idx].completed
    entries.value[idx] = {
      ...entries.value[idx],
      completed: !current,
      completedAt: !current ? Date.now() : null,
    }
    try {
      await entriesApi.toggle(id)
      // API returns updated entry — we already toggled optimistically
    } catch (e) {
      // Revert on error
      entries.value[idx] = {
        ...entries.value[idx],
        completed: current,
        completedAt: current ? entries.value[idx].completedAt : null,
      }
      error.value = e.message
    }
  }

  // ── Analytics helpers ────────────────────────────────────────────
  function getLastMonthByCategory(categoryId) {
    const start = dayjs().subtract(30, 'day')
    return entries.value
      .filter(e => e.type === 'expense' && e.categoryId === categoryId && dayjs(e.date).isAfter(start))
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  }

  function getLastMonthByIncomeCat(categoryId) {
    const start = dayjs().subtract(30, 'day')
    return entries.value
      .filter(e => e.type === 'income' && e.categoryId === categoryId && dayjs(e.date).isAfter(start))
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  }

  function getLastMonthExpenses() {
    const start = dayjs().subtract(30, 'day')
    return entries.value.filter(e => e.type === 'expense' && dayjs(e.date).isAfter(start))
  }

  function getLastMonthIncomes() {
    const start = dayjs().subtract(30, 'day')
    return entries.value.filter(e => e.type === 'income' && dayjs(e.date).isAfter(start))
  }

  function getEntriesForMonth(yearMonth) {
    return entries.value.filter(e => e.date.startsWith(yearMonth))
  }

  function getMonthlySummary(yearMonth) {
    const all      = getEntriesForMonth(yearMonth)
    const expenses = all.filter(e => e.type === 'expense')
    const incomes  = all.filter(e => e.type === 'income')
    const events   = all.filter(e => e.type === 'event')
    return {
      yearMonth,
      expenses,
      incomes,
      events,
      totalExpenses: expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
      totalIncomes:  incomes.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
      balance: incomes.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
             - expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
    }
  }

  function getAvailableMonths() {
    const months = new Set(entries.value.map(e => e.date.slice(0, 7)))
    return [...months].sort().reverse()
  }

  return {
    entries, loading, error, loaded,
    sortedEntries, expensesOnly, incomesOnly, eventsOnly,
    fetchAll, entriesForDate, addEntry, updateEntry, deleteEntry, toggleComplete,
    getLastMonthByCategory, getLastMonthByIncomeCat,
    getLastMonthExpenses, getLastMonthIncomes,
    getEntriesForMonth, getMonthlySummary, getAvailableMonths,
  }
})
