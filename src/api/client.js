// Central API client — all requests go through here
// Base URL configurable via env var (Vite exposes VITE_* vars)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TOKEN_KEY = 'et_access_token'
const REFRESH_KEY = 'et_refresh_token'

export function getAccessToken() { return localStorage.getItem(TOKEN_KEY) }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY) }

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// Attempt a silent token refresh; returns true if successful
async function tryRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/api/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

// Core request function — handles auth header, 401 refresh, JSON parsing
export async function apiRequest(path, options = {}) {
  const token = getAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`

  let res = await fetch(url, { ...options, headers })

  // On 401, try refreshing once then retry
  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const newToken = getAccessToken()
      res = await fetch(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      })
    }
  }

  if (!res.ok) {
    let errorBody = null
    try { errorBody = await res.json() } catch { /* ignore */ }
    const err = new Error(errorBody?.title || errorBody?.detail || `API error ${res.status}`)
    err.status = res.status
    err.body = errorBody
    throw err
  }

  // 204 No Content or empty body
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

export const api = {
  get:    (path, params) => {
    const url = params ? `${path}?${new URLSearchParams(params)}` : path
    return apiRequest(url, { method: 'GET' })
  },
  post:   (path, body) => apiRequest(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => apiRequest(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path, body) => apiRequest(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}