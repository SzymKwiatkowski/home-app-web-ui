import { defineStore } from 'pinia'
import { ref } from 'vue'
import { entryKindsApi } from '@/api/adapters'

// icon and color are now stored server-side via CreateEntryEntityKind / GetEntryEntityKind.
// We keep a localStorage meta cache only as an offline fallback.
const META_KEY = 'et_kind_meta'

const DEFAULT_ICONS  = { expense: '💰', income: '💚', event: '📅' }
const DEFAULT_COLORS = { expense: '#e07b39', income: '#2d6a4f', event: '#374151' }

export const useEntryTypesStore = defineStore('entryTypes', () => {
  const types   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  // Fallback meta in case API returns null icon/color (shouldn't happen with new spec)
  const meta = ref(JSON.parse(localStorage.getItem(META_KEY) || '{}'))
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta.value)) }

  function mergeWithMeta(kind) {
    const m = meta.value[kind.id] || {}
    return {
      ...kind,
      icon:  kind.icon  || m.icon  || DEFAULT_ICONS[kind.entryType]  || '🏷️',
      color: kind.color || m.color || DEFAULT_COLORS[kind.entryType] || '#888888',
    }
  }

  // ── Fetch ────────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const raw = await entryKindsApi.getAll()
      types.value = raw.map(mergeWithMeta)
      // Sync server values into local meta cache
      for (const t of types.value) {
        if (t.icon || t.color) {
          meta.value[t.id] = { icon: t.icon, color: t.color }
        }
      }
      saveMeta()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── Create ───────────────────────────────────────────────────────
  // CreateEntryEntityKind now accepts icon + color → sent to API
  async function addType(type) {
    loading.value = true
    error.value = null
    try {
      const id = await entryKindsApi.create(type)   // returns int32
      meta.value[id] = { icon: type.icon, color: type.color }
      saveMeta()
      const newType = mergeWithMeta({ id, name: type.name, entryType: type.entryType, icon: type.icon, color: type.color })
      types.value.push(newType)
      return id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // ── Update — icon/color changes are local only (no PUT endpoint yet) ──
  function updateType(id, data) {
    const idx = types.value.findIndex(t => String(t.id) === String(id))
    if (idx !== -1) {
      types.value[idx] = { ...types.value[idx], ...data }
      meta.value[id] = {
        icon:  data.icon  || types.value[idx].icon,
        color: data.color || types.value[idx].color,
      }
      saveMeta()
    }
  }

  // ── Delete — optimistic (no DELETE endpoint yet) ─────────────────
  function deleteType(id) {
    types.value = types.value.filter(t => String(t.id) !== String(id))
    delete meta.value[id]
    saveMeta()
  }

  function forEntryType(entryType) {
    return types.value.filter(t => t.entryType === entryType)
  }

  function getById(id) {
    if (id == null) return undefined
    return types.value.find(t => String(t.id) === String(id))
  }

  return {
    types, loading, error,
    fetchAll, addType, updateType, deleteType, forEntryType, getById,
  }
})
