import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Colours cycled through for auto-assigning avatar colour to new users
const AVATAR_COLORS = [
  '#2d6a4f', '#1a6eb5', '#c2556a', '#c47a1a', '#7c3aed', '#0891b2', '#be185d', '#15803d',
]

const DEFAULT_USERS = [
  { id: 1, name: 'You', email: '', color: AVATAR_COLORS[0], isSelf: true },
]

export const useUsersStore = defineStore('users', () => {
  const users = ref(JSON.parse(localStorage.getItem('et_users') || JSON.stringify(DEFAULT_USERS)))

  function save() { localStorage.setItem('et_users', JSON.stringify(users.value)) }

  const allUsers = computed(() => users.value)
  const selfUser = computed(() => users.value.find(u => u.isSelf) || users.value[0])

  function getById(id) { return users.value.find(u => u.id === id) }

  function getAvatar(id) {
    const u = getById(id)
    return u ? u.name[0].toUpperCase() : '?'
  }

  function getColor(id) {
    const u = getById(id)
    return u?.color || AVATAR_COLORS[0]
  }

  // Called from auth store when user logs in — sync name/email to self entry
  function syncSelf(name, email) {
    const idx = users.value.findIndex(u => u.isSelf)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], name: name || 'You', email: email || '' }
    } else {
      users.value.unshift({ id: 1, name: name || 'You', email: email || '', color: AVATAR_COLORS[0], isSelf: true })
    }
    save()
  }

  function addUser(userData) {
    const id = Date.now()
    const colorIdx = (users.value.length) % AVATAR_COLORS.length
    users.value.push({ id, isSelf: false, color: AVATAR_COLORS[colorIdx], ...userData })
    save()
    return id
  }

  function updateUser(id, data) {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) { users.value[idx] = { ...users.value[idx], ...data }; save() }
  }

  function removeUser(id) {
    if (users.value.find(u => u.id === id)?.isSelf) return // cannot remove self
    users.value = users.value.filter(u => u.id !== id)
    save()
  }

  return { users, allUsers, selfUser, getById, getAvatar, getColor, syncSelf, addUser, updateUser, removeUser }
})
