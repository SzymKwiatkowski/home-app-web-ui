import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/api/adapters'
import { uuid } from '@/api/uuid'

const AVATAR_COLORS = [
  '#2d6a4f', '#1a6eb5', '#c2556a', '#c47a1a', '#7c3aed', '#0891b2', '#be185d', '#15803d',
]

// Local metadata stored per user UUID: { color, isSelf }
const META_KEY = 'et_user_meta'
const SELF_PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000001'

export const useUsersStore = defineStore('users', () => {
  const users   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  // Local metadata keyed by user UUID: { color, isSelf, name (override) }
  const meta = ref(JSON.parse(localStorage.getItem(META_KEY) || '{}'))
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta.value)) }

  // ── Computed ─────────────────────────────────────────────────────
  const allUsers = computed(() => users.value)
  const selfUser = computed(() => users.value.find(u => u.isSelf) || users.value[0] || null)
  const selfId   = computed(() => selfUser.value?.id ?? SELF_PLACEHOLDER_ID)

  // ── Helpers ───────────────────────────────────────────────────────
  function getById(id) {
    return users.value.find(u => String(u.id) === String(id))
  }
  function getAvatar(id) { const u = getById(id); return u ? (u.name || u.email || '?')[0].toUpperCase() : '?' }
  function getColor(id)  { const u = getById(id); return u?.color || AVATAR_COLORS[0] }

  function assignColor(id, index) {
    return (meta.value[id]?.color) || AVATAR_COLORS[index % AVATAR_COLORS.length]
  }

  function mergeWithMeta(apiUser, index, selfUserId) {
    const m = meta.value[apiUser.id] || {}
    return {
      ...apiUser,
      color:  m.color  || AVATAR_COLORS[index % AVATAR_COLORS.length],
      isSelf: apiUser.id === selfUserId,
    }
  }

  // ── Fetch from API ────────────────────────────────────────────────
  async function fetchAll(selfUserId) {
    loading.value = true
    error.value   = null
    try {
      const apiUsers = await usersApi.getAll()
      users.value = apiUsers.map((u, i) => mergeWithMeta(u, i, selfUserId))
    } catch (e) {
      error.value = e.message
      // If fetch fails and we have no users yet, keep any existing local list
    } finally {
      loading.value = false
    }
  }

  // ── syncSelf — called after login to mark the authenticated user ──
  // Updates the isSelf flag and persists the color choice.
  function syncSelf(id, name, email) {
    // Update isSelf flag across all users
    users.value = users.value.map(u => ({ ...u, isSelf: String(u.id) === String(id) }))

    // If the self user isn't in the list yet (e.g. fetchAll not done), add a placeholder
    if (!users.value.find(u => u.isSelf)) {
      const color = meta.value[id]?.color || AVATAR_COLORS[0]
      users.value.unshift({ id, name: name || email?.split('@')[0] || 'You', email: email || '', color, isSelf: true })
    }

    // Persist color for self if not already set
    if (!meta.value[id]) {
      meta.value[id] = { color: AVATAR_COLORS[0] }
      saveMeta()
    }
  }

  // ── Local-only mutations (for users not yet in the API list) ──────
  // NOTE: There is no POST /api/users — users are created via /api/users/register.
  // This addUser is for the local user picker only (e.g. adding known colleagues by name).
  function addUser(userData) {
    const id = uuid()
    const colorIdx = users.value.length % AVATAR_COLORS.length
    const color = userData.color || AVATAR_COLORS[colorIdx]
    meta.value[id] = { color }
    saveMeta()
    const user = { id, isSelf: false, color, name: userData.name, email: userData.email || '' }
    users.value.push(user)
    return id
  }

  function updateUser(id, data) {
    const idx = users.value.findIndex(u => String(u.id) === String(id))
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...data }
      if (data.color) {
        meta.value[id] = { ...meta.value[id], color: data.color }
        saveMeta()
      }
    }
  }

  function removeUser(id) {
    if (users.value.find(u => String(u.id) === String(id))?.isSelf) return
    users.value = users.value.filter(u => String(u.id) !== String(id))
    delete meta.value[id]
    saveMeta()
  }

  return {
    users, loading, error,
    allUsers, selfUser, selfId,
    getById, getAvatar, getColor,
    fetchAll, syncSelf, addUser, updateUser, removeUser,
  }
})
