import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/api/adapters'
import { setTokens, clearTokens, getAccessToken } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('et_user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value && !!getAccessToken())

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await usersApi.login(email, password)
      setTokens(data.accessToken, data.refreshToken)

      // Fetch profile info to get email confirmation status
      const info = await usersApi.getInfo()

      user.value = {
        id: null,          // API has no user ID on login response
        email: info.email,
        name: email.split('@')[0],   // derive display name from email until API provides it
        avatar: email[0].toUpperCase(),
        isEmailConfirmed: info.isEmailConfirmed,
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('et_user', JSON.stringify(user.value))
      _syncSelf(user.value.name, user.value.email)
      return true
    } catch (e) {
      error.value = e.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(email, password) {
    loading.value = true
    error.value = null
    try {
      await usersApi.register(email, password)
      return true
    } catch (e) {
      error.value = e.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    clearTokens()
    localStorage.removeItem('et_user')
  }

  async function updateProfile(data) {
    loading.value = true
    error.value = null
    try {
      if (data.email || data.password) {
        await usersApi.updateInfo({
          newEmail: data.email || undefined,
          newPassword: data.password || undefined,
          oldPassword: data.oldPassword || undefined,
        })
      }
      user.value = {
        ...user.value,
        ...data,
        avatar: (data.name || user.value.name || user.value.email)[0].toUpperCase(),
      }
      localStorage.setItem('et_user', JSON.stringify(user.value))
      _syncSelf(user.value.name, user.value.email)
      return true
    } catch (e) {
      error.value = e.message || 'Update failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function _syncSelf(name, email) {
    import('./users').then(({ useUsersStore }) => {
      useUsersStore().syncSelf(name, email)
    })
  }

  return { user, loading, error, isLoggedIn, login, register, logout, updateProfile }
})
