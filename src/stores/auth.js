import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('et_user') || 'null'))

  const isLoggedIn = computed(() => !!user.value)

  function login(userData) {
    user.value = {
      id: 1,
      name: userData.name || 'You',
      email: userData.email,
      avatar: userData.name ? userData.name[0].toUpperCase() : 'U',
      joinedAt: new Date().toISOString(),
    }
    localStorage.setItem('et_user', JSON.stringify(user.value))
    // Sync into users store so self appears in assignee pickers
    _syncSelf(user.value.name, user.value.email)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('et_user')
  }

  function updateProfile(data) {
    user.value = { ...user.value, ...data, avatar: (data.name || user.value.name)[0].toUpperCase() }
    localStorage.setItem('et_user', JSON.stringify(user.value))
    _syncSelf(user.value.name, user.value.email)
  }

  function _syncSelf(name, email) {
    // Lazy import to avoid circular deps
    import('./users').then(({ useUsersStore }) => {
      useUsersStore().syncSelf(name, email)
    })
  }

  return { user, isLoggedIn, login, logout, updateProfile }
})
