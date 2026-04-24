import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/api/adapters'
import { setTokens, clearTokens, getAccessToken } from '@/api/client'

/** Decode the `sub` claim from a JWT without verifying signature */
function jwtSub(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub || payload.nameid || null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(JSON.parse(localStorage.getItem('et_user') || 'null'))
  const loading = ref(false)
  const error   = ref(null)

  const isLoggedIn = computed(() => !!user.value && !!getAccessToken())

  async function login(email, password) {
    loading.value = true
    error.value   = null
    try {
      const tokenData = await usersApi.login(email, password)
      setTokens(tokenData.accessToken, tokenData.refreshToken)

      // Extract user UUID from JWT sub claim
      const userId = jwtSub(tokenData.accessToken)

      const info = await usersApi.getInfo()
      const displayName = info.email.split('@')[0]

      user.value = {
        id: userId,
        email: info.email,
        name: displayName,
        avatar: displayName[0].toUpperCase(),
        isEmailConfirmed: info.isEmailConfirmed,
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('et_user', JSON.stringify(user.value))
      _syncSelf(userId, displayName, info.email)
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
    error.value   = null
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
    error.value   = null
    try {
      if (data.email || data.newPassword) {
        await usersApi.updateInfo({
          newEmail:    data.email       || undefined,
          newPassword: data.newPassword || undefined,
          oldPassword: data.oldPassword || undefined,
        })
      }
      const name = data.name || user.value.name
      user.value = { ...user.value, ...data, name, avatar: name[0].toUpperCase() }
      localStorage.setItem('et_user', JSON.stringify(user.value))
      _syncSelf(user.value.id, name, user.value.email)
      return true
    } catch (e) {
      error.value = e.message || 'Update failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function _syncSelf(id, name, email) {
    import('./users').then(({ useUsersStore }) => {
      useUsersStore().syncSelf(id, name, email)
    })
  }

  return { user, loading, error, isLoggedIn, login, register, logout, updateProfile }
})
