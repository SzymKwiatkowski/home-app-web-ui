<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-icon">₤</div>
        <h1>Ledger</h1>
        <p class="text-secondary">Your personal finance & events tracker</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Full name</label>
          <input v-model="form.name" class="form-input" type="text" placeholder="Jane Smith" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email address</label>
          <input v-model="form.email" class="form-input" type="email" placeholder="jane@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="••••••••" required />
        </div>
        <button class="btn btn-primary login-btn" type="submit">
          Sign in to Ledger →
        </button>
        <p class="login-note text-muted text-sm">
          New here? Just fill in your details to create an account.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })

function handleLogin() {
  auth.login({ name: form.name, email: form.email })
  router.push('/entries')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-bg);
}
.login-card {
  width: 100%;
  max-width: 400px;
}
.login-brand {
  text-align: center;
  margin-bottom: 2.5rem;
}
.brand-icon {
  width: 56px; height: 56px;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}
.login-brand h1 { margin-bottom: 0.375rem; }
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.login-btn { width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem; margin-top: 0.5rem; }
.login-note { text-align: center; }
</style>