import { defineStore } from 'pinia'
import { ref } from 'vue'
import { entryKindsApi } from '@/api/adapters'

// Local UI metadata (icon + color) keyed by API id — stored in localStorage
const META_KEY = 'et_kind_meta'

// Fallback defaults used when creating new kinds locally before API id is known
const DEFAULT_ICONS = { expense: '💰', income: '💚', event: '📅' }
const DEFAULT_COLORS = { expense: '#e07b39', income: '#2d6a4f', event: '#374151' }

const AVATAR_COLORS = [
  '#e07b39','#3b82f6','#8b5cf6','#10b981','#f59e0b','#6b7280',
  '#2d6a4f','#0891b2','#7c3aed','#be185d','#c47a1a',
  '#374151','#dc2626','#7c3aed','#0891b2','#f59e0b',
]

export const useEntryTypesStore = defineStore('entryTypes', () => {
  const types   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  // Local icon/color metadata: { [id]: { icon, color } }
  const meta = ref(JSON.parse(localStorage.getItem(META_KEY) || '{}'))

  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta.value)) }

  function mergeWithMeta(kind) {
    const m = meta.value[kind.id] || {}
    return {
      ...kind,
      icon:  kind.icon  || DEFAULT_ICONS[kind.entryType]  || '🏷️',
      color: kind.color || DEFAULT_COLORS[kind.entryType] || AVATAR_COLORS[kind.id % AVATAR_COLORS.length],
    }
  }

  function setMeta(id, icon, color) {
    meta.value[id] = { icon, color }
    saveMeta()
  }

  // ── Fetch ────────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const raw = await entryKindsApi.getAll()
      types.value = raw.map(mergeWithMeta)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── Create ───────────────────────────────────────────────────────
  async function addType(type) {
    loading.value = true
    error.value = null
    try {
      const id = await entryKindsApi.create(type)   // returns int32
      setMeta(id, type.icon, type.color)
      const newType = mergeWithMeta({ id, name: type.name, entryType: type.entryType })
      types.value.push(newType)
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // ── Update (icon/color only — API has no PUT for kinds) ──────────
  function updateType(id, data) {
    const idx = types.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      if (data.icon || data.color) {
        setMeta(id, data.icon || types.value[idx].icon, data.color || types.value[idx].color)
      }
      types.value[idx] = { ...types.value[idx], ...data }
    }
  }

  // ── Delete (optimistic — API has no DELETE for kinds yet) ────────
  function deleteType(id) {
    types.value = types.value.filter(t => t.id !== id)
    delete meta.value[id]
    saveMeta()
  }

  function forEntryType(entryType) {
    return types.value.filter(t => t.entryType === entryType)
  }

  function getById(id) {
    return types.value.find(t => t.id === id)
  }

  return {
    types, loading, error,
    fetchAll, addType, updateType, deleteType, forEntryType, getById,
  }
})
