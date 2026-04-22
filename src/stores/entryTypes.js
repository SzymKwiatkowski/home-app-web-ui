import { defineStore } from 'pinia'
import { ref } from 'vue'

// entryType: 'expense' | 'income' | 'event'
const DEFAULT_TYPES = [
  // Expense categories
  { id: 1,  entryType: 'expense', name: 'Food & Dining',   icon: '🍽️', color: '#e07b39' },
  { id: 2,  entryType: 'expense', name: 'Transport',        icon: '🚗', color: '#3b82f6' },
  { id: 3,  entryType: 'expense', name: 'Shopping',         icon: '🛍️', color: '#8b5cf6' },
  { id: 4,  entryType: 'expense', name: 'Health',           icon: '💊', color: '#10b981' },
  { id: 5,  entryType: 'expense', name: 'Entertainment',    icon: '🎬', color: '#f59e0b' },
  { id: 6,  entryType: 'expense', name: 'Utilities',        icon: '💡', color: '#6b7280' },
  // Income categories
  { id: 7,  entryType: 'income',  name: 'Salary',           icon: '💼', color: '#2d6a4f' },
  { id: 8,  entryType: 'income',  name: 'Freelance',        icon: '💻', color: '#0891b2' },
  { id: 9,  entryType: 'income',  name: 'Investment',       icon: '📈', color: '#7c3aed' },
  { id: 10, entryType: 'income',  name: 'Rental',           icon: '🏠', color: '#be185d' },
  { id: 11, entryType: 'income',  name: 'Gift / Bonus',     icon: '🎁', color: '#c47a1a' },
  // Event categories
  { id: 12, entryType: 'event',   name: 'Meeting',          icon: '🤝', color: '#374151' },
  { id: 13, entryType: 'event',   name: 'Medical',          icon: '🩺', color: '#dc2626' },
  { id: 14, entryType: 'event',   name: 'Personal',         icon: '🧘', color: '#7c3aed' },
  { id: 15, entryType: 'event',   name: 'Travel',           icon: '✈️', color: '#0891b2' },
  { id: 16, entryType: 'event',   name: 'Social',           icon: '🎉', color: '#f59e0b' },
]

export const useEntryTypesStore = defineStore('entryTypes', () => {
  // Migrate from old 'et_types' key if present, then use new key
  function loadInitial() {
    const fresh = localStorage.getItem('et_entry_types')
    if (fresh) return JSON.parse(fresh)
    // Migrate old expense-only types, tagging them as 'expense'
    const old = localStorage.getItem('et_types')
    if (old) {
      const migrated = JSON.parse(old).map(t => ({ ...t, entryType: t.entryType || 'expense' }))
      // Append default income + event types (ids won't clash — old ids are small numbers or timestamps)
      const defaultNonExpense = DEFAULT_TYPES.filter(t => t.entryType !== 'expense')
      return [...migrated, ...defaultNonExpense]
    }
    return DEFAULT_TYPES
  }

  const types = ref(loadInitial())

  function save() { localStorage.setItem('et_entry_types', JSON.stringify(types.value)) }

  function forEntryType(entryType) {
    return types.value.filter(t => t.entryType === entryType)
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

  return { types, forEntryType, addType, updateType, deleteType, getById }
})
