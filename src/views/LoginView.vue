<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-icon">₤</div>
        <h1>Ledger</h1>
        <p class="text-secondary">Your personal finance &amp; events tracker</p>
      </div>

      <!-- Mode toggle -->
      <div class="tab-bar login-tabs">
        <button class="tab-item" :class="{ active: mode === 'login' }" @click="mode = 'login'">Sign in</button>
        <button class="tab-item" :class="{ active: mode === 'register' }" @click="mode = 'register'">Register</button>
      </div>

      <!-- Error banner -->
      <Transition name="fade">
        <div v-if="auth.error" class="error-banner">
          ⚠️ {{ auth.error }}
        </div>
      </Transition>

      <!-- Login form -->
      <form v-if="mode === 'login'" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email address</label>
          <input v-model="form.email" class="form-input" type="email" placeholder="jane@example.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <button class="btn btn-primary login-btn" type="submit" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          {{ auth.loading ? 'Signing in…' : 'Sign in →' }}
        </button>
      </form>

      <!-- Register form -->
      <form v-else class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Email address</label>
          <input v-model="form.email" class="form-input" type="email" placeholder="jane@example.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="Min. 6 characters" required autocomplete="new-password" />
        </div>
        <button class="btn btn-accent login-btn" type="submit" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          {{ auth.loading ? 'Creating account…' : 'Create account →' }}
        </button>
        <Transition name="fade">
          <p v-if="registered" class="success-note text-sm">
            ✅ Account created! Check your email to confirm, then sign in.
          </p>
        </Transition>
      </form>

      <p class="login-note text-muted text-sm">Connects to <code>{{ apiUrl }}</code></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const mode = ref('login')
const registered = ref(false)
const form = reactive({ email: '', password: '' })

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleLogin() {
  const ok = await auth.login(form.email, form.password)
  if (ok) router.push('/entries')
}

async function handleRegister() {
  registered.value = false
  const ok = await auth.register(form.email, form.password)
  if (ok) {
    registered.value = true
    mode.value = 'login'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; display: flex;
  align-items: center; justify-content: center;
  padding: 1.5rem; background: var(--color-bg);
}
.login-card { width: 100%; max-width: 400px; }
.login-brand { text-align: center; margin-bottom: 1.75rem; }
.brand-icon {
  width: 56px; height: 56px; background: var(--color-text); color: var(--color-bg);
  border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 1.5rem; margin: 0 auto 1rem;
}
.login-brand h1 { margin-bottom: 0.375rem; }

.login-tabs { margin-bottom: 1.25rem; }

.error-banner {
  background: var(--color-danger-light); color: var(--color-danger);
  border: 1px solid var(--color-danger); border-radius: var(--radius-md);
  padding: 0.625rem 0.875rem; font-size: 0.875rem; margin-bottom: 1rem;
}
.success-note { color: var(--color-accent); margin-top: 0.5rem; }

.login-form { display: flex; flex-direction: column; gap: 1rem; }
.login-btn { width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem; gap: 0.5rem; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

.spinner {
  width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-note { text-align: center; margin-top: 1rem; }
code { font-size: 0.75rem; background: var(--color-surface-2); padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>
