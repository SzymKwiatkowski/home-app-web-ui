import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_TYPES = [
  { id: 1, name: 'Food & Dining', icon: '🍽️', color: '#e07b39' },
  { id: 2, name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 3, name: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { id: 4, name: 'Health', icon: '💊', color: '#10b981' },
  { id: 5, name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { id: 6, name: 'Utilities', icon: '💡', color: '#6b7280' },
]

export const useExpenseTypesStore = defineStore('expenseTypes', () => {
  const types = ref(JSON.parse(localStorage.getItem('et_types') || JSON.stringify(DEFAULT_TYPES)))

  function save() {
    localStorage.setItem('et_types', JSON.stringify(types.value))
  }

  function addType(type) {
    const id = Date.now()
    types.value.push({ ...type, id })
    save()
    return id
  }

  function updateType(id, data) {
    const idx = types.value.findIndex(t => t.id === id)
    if (idx !== -1) { types.value[idx] = { ...types.value[idx], ...data }; save() }
  }

  function deleteType(id) {
    types.value = types.value.filter(t => t.id !== id)
    save()
  }

  function getById(id) {
    return types.value.find(t => t.id === id)
  }

  return { types, addType, updateType, deleteType, getById }
})