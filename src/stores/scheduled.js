import { defineStore } from 'pinia'
import { ref } from 'vue'
import { periodicEntriesApi } from '@/api/adapters'

// RECURRENCE_OPTIONS moved to @/api/cron.js

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
      const id = await periodicEntriesApi.create(item)
      items.value.push({ ...item, id })
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // PUT /api/periodicentries/{id} — full update
  async function update(id, data) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1) return
    const merged = { ...items.value[idx], ...data }
    // Optimistic
    items.value[idx] = merged
    try {
      await periodicEntriesApi.update(id, merged)
    } catch (e) {
      error.value = e.message
      await fetchAll()  // revert by re-fetching
    }
  }

  // PUT /api/periodicentries/{id} — toggle isActive
  async function toggle(id) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1) return
    const item = items.value[idx]
    // Optimistic
    items.value[idx] = { ...item, active: !item.active }
    try {
      await periodicEntriesApi.toggle(id, item)
    } catch (e) {
      error.value = e.message
      items.value[idx] = item  // revert
    }
  }

  // Local remove only (no DELETE endpoint yet)
  function remove(id) {
    items.value = items.value.filter(s => s.id !== id)
  }

  return { items, loading, error, fetchAll, add, update, toggle, remove }
})
