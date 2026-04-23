import { defineStore } from 'pinia'
import { ref } from 'vue'
import { periodicEntriesApi } from '@/api/adapters'
import dayjs from 'dayjs'

export const RECURRENCE_OPTIONS = [
  { value: 'daily',     label: 'Every day' },
  { value: 'weekly',    label: 'Every week' },
  { value: 'biweekly',  label: 'Every 2 weeks' },
  { value: 'monthly',   label: 'Every month' },
  { value: 'quarterly', label: 'Every quarter' },
  { value: 'yearly',    label: 'Every year' },
]

export const useScheduledStore = defineStore('scheduled', () => {
  const items   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await periodicEntriesApi.getAll()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function add(item) {
    loading.value = true
    error.value = null
    try {
      const id = await periodicEntriesApi.create(item)   // returns UUID
      items.value.push({ ...item, id })
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update and toggle are optimistic — API has no PUT for periodic entries yet
  function update(id, data) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...data }
  }

  function remove(id) {
    items.value = items.value.filter(s => s.id !== id)
  }

  function toggle(id) {
    const item = items.value.find(s => s.id === id)
    if (item) item.active = !item.active
  }

  return { items, loading, error, fetchAll, add, update, remove, toggle }
})
