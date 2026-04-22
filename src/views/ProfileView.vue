<template>
  <div class="main-content">
    <h1 style="margin-bottom:1.5rem">Profile</h1>

    <!-- Avatar & name -->
    <div class="profile-hero card" style="margin-bottom:1.25rem">
      <div class="avatar">{{ auth.user?.avatar }}</div>
      <div>
        <div class="font-semibold" style="font-size:1.1rem">{{ auth.user?.name }}</div>
        <div class="text-secondary text-sm">{{ auth.user?.email }}</div>
        <div class="text-muted text-xs" style="margin-top:0.25rem">
          Member since {{ joinedFormatted }}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card card-flat">
        <div class="stat-value">{{ stats.totalExpenses }}</div>
        <div class="stat-label text-xs text-muted">Total expenses</div>
      </div>
      <div class="stat-card card-flat">
        <div class="stat-value">${{ stats.totalSpent }}</div>
        <div class="stat-label text-xs text-muted">Total spent</div>
      </div>
      <div class="stat-card card-flat">
        <div class="stat-value">{{ stats.totalEvents }}</div>
        <div class="stat-label text-xs text-muted">Events logged</div>
      </div>
      <div class="stat-card card-flat">
        <div class="stat-value">{{ stats.categories }}</div>
        <div class="stat-label text-xs text-muted">Categories</div>
      </div>
    </div>

    <!-- Appearance -->
    <div class="section-label">Appearance</div>
    <div class="card" style="margin-bottom:1.5rem">
      <p class="text-secondary text-sm" style="margin-bottom:1.125rem">
        Choose a theme. Your preference is saved in your browser.
      </p>
      <div class="theme-grid">
        <button
          v-for="theme in themeStore.themes"
          :key="theme.id"
          class="theme-card"
          :class="{ active: themeStore.activeId === theme.id }"
          @click="themeStore.setTheme(theme.id)"
        >
          <div class="theme-preview" :style="{ background: theme.preview[0] }">
            <div class="preview-topbar" :style="{ background: theme.preview[2] + '18' }">
              <div class="preview-dot" :style="{ background: theme.preview[2] + '60' }"></div>
              <div class="preview-dot" :style="{ background: theme.preview[2] + '60' }"></div>
            </div>
            <div class="preview-content">
              <div class="preview-card" :style="{ background: theme.preview[2] + '12', borderColor: theme.preview[2] + '20' }">
                <div class="preview-line long" :style="{ background: theme.preview[2] + '70' }"></div>
                <div class="preview-line short" :style="{ background: theme.preview[1] + 'cc' }"></div>
              </div>
              <div class="preview-card" :style="{ background: theme.preview[2] + '08', borderColor: theme.preview[2] + '14' }">
                <div class="preview-line med" :style="{ background: theme.preview[2] + '50' }"></div>
                <div class="preview-pill" :style="{ background: theme.preview[1] + '44' }"></div>
              </div>
            </div>
          </div>
          <div class="theme-label">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-desc">{{ theme.description }}</div>
          </div>
          <div v-if="themeStore.activeId === theme.id" class="theme-active-badge">✓</div>
        </button>
      </div>
    </div>

    <!-- Currency preference -->
    <div class="section-label">Default currency</div>
    <div class="card" style="margin-bottom:1.5rem">
      <p class="text-secondary text-sm" style="margin-bottom:1rem">
        Used by default when creating new expenses and incomes.
      </p>
      <div class="currency-grid">
        <button
          v-for="cur in currencyStore.currencies"
          :key="cur.code"
          class="currency-card"
          :class="{ active: currencyStore.defaultCode === cur.code }"
          @click="currencyStore.setDefault(cur.code)"
        >
          <span class="cur-symbol">{{ cur.symbol }}</span>
          <span class="cur-code">{{ cur.code }}</span>
          <span class="cur-name text-xs text-muted">{{ cur.name }}</span>
          <span v-if="currencyStore.defaultCode === cur.code" class="cur-check">✓</span>
        </button>
      </div>
    </div>

    <!-- Edit profile -->
    <div class="section-label">Edit profile</div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="form-fields">
        <div class="form-group">
          <label class="form-label">Full name</label>
          <input v-model="editForm.name" class="form-input" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="editForm.email" class="form-input" type="email" placeholder="you@example.com" />
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <button class="btn btn-primary" style="align-self:flex-start" @click="saveProfile">Save changes</button>
          <Transition name="fade">
            <span v-if="saved" class="text-accent text-sm">Saved!</span>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Users -->
    <div class="section-label">Users</div>
    <div class="card" style="margin-bottom:1.5rem">
      <p class="text-secondary text-sm" style="margin-bottom:1rem">
        Users can be assigned to entries, incomes, and events.
      </p>
      <div class="users-list">
        <div v-for="user in usersStore.allUsers" :key="user.id" class="user-row">
          <div class="user-row-left">
            <span class="user-avatar-md" :style="{ background: user.color }">{{ user.name[0].toUpperCase() }}</span>
            <div>
              <div class="font-medium text-sm">{{ user.name }} <span v-if="user.isSelf" class="badge badge-neutral" style="font-size:0.65rem">You</span></div>
              <div v-if="user.email" class="text-xs text-muted">{{ user.email }}</div>
            </div>
          </div>
          <div class="user-row-actions">
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEditUser(user)" title="Edit">✏️</button>
            <button v-if="!user.isSelf" class="btn btn-ghost btn-icon btn-sm" @click="confirmRemoveUserId = user.id" title="Remove">🗑️</button>
          </div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-top:0.75rem" @click="openAddUser">+ Add user</button>
    </div>

    <!-- User add/edit modal -->
    <Teleport to="body">
      <div v-if="showUserModal" class="modal-backdrop" @click.self="closeUserModal">
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit user' : 'Add user' }}</h3>
            <button class="btn btn-ghost btn-icon" @click="closeUserModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-fields">
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input v-model="userForm.name" class="form-input" placeholder="Full name" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="userForm.email" class="form-input" type="email" placeholder="email@example.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Avatar colour</label>
                <div class="color-swatches">
                  <button
                    v-for="col in avatarColors" :key="col"
                    class="color-swatch"
                    :class="{ selected: userForm.color === col }"
                    :style="{ background: col }"
                    @click="userForm.color = col"
                  ></button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeUserModal">Cancel</button>
            <button class="btn btn-primary" @click="saveUser">{{ editingUser ? 'Save' : 'Add' }}</button>
          </div>
        </div>
      </div>
      <div v-if="confirmRemoveUserId" class="modal-backdrop" @click.self="confirmRemoveUserId = null">
        <div class="modal" style="max-width:360px">
          <div class="modal-header"><h3>Remove user?</h3></div>
          <div class="modal-body"><p class="text-secondary">Their entries will remain but become unassigned.</p></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="confirmRemoveUserId = null">Cancel</button>
            <button class="btn btn-danger" @click="doRemoveUser">Remove</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Account -->
    <div class="section-label">Account</div>
    <div class="card-flat danger-card">
      <div>
        <div class="font-medium">Sign out</div>
        <div class="text-secondary text-sm">You can sign back in anytime.</div>
      </div>
      <button class="btn btn-danger" @click="handleLogout">Sign out</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEntriesStore } from '@/stores/entries'
import { useEntryTypesStore } from '@/stores/entryTypes'
import { useThemeStore } from '@/stores/theme'
import { useCurrencyStore } from '@/stores/currency'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const auth = useAuthStore()
const entriesStore = useEntriesStore()
const typesStore = useEntryTypesStore()
const themeStore = useThemeStore()
const currencyStore = useCurrencyStore()
const usersStore = useUsersStore()
const router = useRouter()

const saved = ref(false)

const joinedFormatted = computed(() =>
  auth.user?.joinedAt ? dayjs(auth.user.joinedAt).format('MMMM YYYY') : 'N/A'
)

const stats = computed(() => ({
  totalExpenses: entriesStore.expensesOnly.length,
  totalSpent: entriesStore.expensesOnly.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toFixed(2),
  totalEvents: entriesStore.eventsOnly.length,
  categories: typesStore.types.length,
}))

const editForm = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
})

function saveProfile() {
  if (!editForm.name || !editForm.email) return
  auth.updateProfile({ name: editForm.name, email: editForm.email })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

// User management
const AVATAR_COLORS_LIST = ['#2d6a4f','#1a6eb5','#c2556a','#c47a1a','#7c3aed','#0891b2','#be185d','#15803d']
const avatarColors = AVATAR_COLORS_LIST
const showUserModal = ref(false)
const editingUser = ref(null)
const confirmRemoveUserId = ref(null)
const userForm = reactive({ name: '', email: '', color: AVATAR_COLORS_LIST[1] })

function openAddUser() {
  editingUser.value = null
  Object.assign(userForm, { name: '', email: '', color: AVATAR_COLORS_LIST[1] })
  showUserModal.value = true
}
function openEditUser(user) {
  editingUser.value = user
  Object.assign(userForm, { name: user.name, email: user.email || '', color: user.color })
  showUserModal.value = true
}
function closeUserModal() { showUserModal.value = false; editingUser.value = null }
function saveUser() {
  if (!userForm.name) return
  if (editingUser.value) {
    usersStore.updateUser(editingUser.value.id, { name: userForm.name, email: userForm.email, color: userForm.color })
  } else {
    usersStore.addUser({ name: userForm.name, email: userForm.email, color: userForm.color })
  }
  closeUserModal()
}
function doRemoveUser() { usersStore.removeUser(confirmRemoveUserId.value); confirmRemoveUserId.value = null }
</script>

<style scoped>
.profile-hero { display: flex; align-items: center; gap: 1rem; }
.avatar {
  width: 56px; height: 56px;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  flex-shrink: 0;
}
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.stat-card { text-align: center; padding: 1rem; }
.stat-value { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-text); }
.stat-label { margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.04em; }
.section-label {
  font-size: 0.75rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-muted); margin-bottom: 0.625rem;
}
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
}
@media (max-width: 480px) {
  .theme-grid { grid-template-columns: repeat(2, 1fr); }
}
.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
  background: var(--color-surface-2);
  text-align: left;
}
.theme-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.theme-card.active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
.theme-preview {
  width: 100%;
  height: 72px;
  padding: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}
.preview-topbar {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.25rem;
  border-radius: 3px;
}
.preview-dot { width: 5px; height: 5px; border-radius: 50%; }
.preview-content { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.preview-card {
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.25rem 0.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  flex: 1;
}
.preview-line { height: 4px; border-radius: 2px; }
.preview-line.long { width: 55%; }
.preview-line.med { width: 40%; }
.preview-line.short { width: 25%; }
.preview-pill { width: 28px; height: 8px; border-radius: 4px; flex-shrink: 0; }
.theme-label { padding: 0.5rem 0.625rem; border-top: 1px solid var(--color-border); }
.theme-name { font-size: 0.8125rem; font-weight: 600; color: var(--color-text); line-height: 1.2; }
.theme-desc { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.1rem; }
.theme-active-badge {
  position: absolute;
  top: 0.4rem; right: 0.4rem;
  width: 18px; height: 18px;
  background: var(--color-accent);
  color: white;
  border-radius: 50%;
  font-size: 0.65rem;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.danger-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.currency-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
@media (max-width: 500px) {
  .currency-grid { grid-template-columns: repeat(3, 1fr); }
}
.currency-card {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  padding: 0.625rem 0.25rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer; background: var(--color-surface-2);
  transition: all 0.18s ease; text-align: center;
}
.currency-card:hover { border-color: var(--color-border-strong); transform: translateY(-1px); }
.currency-card.active { border-color: var(--color-accent); box-shadow: 0 0 0 1px var(--color-accent); background: var(--color-accent-light); }
.cur-symbol { font-size: 1.125rem; font-weight: 700; color: var(--color-text); line-height: 1; }
.cur-code { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); margin-top: 0.15rem; }
.cur-name { display: block; font-size: 0.65rem; margin-top: 0.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.cur-check {
  position: absolute; top: 3px; right: 3px;
  width: 15px; height: 15px;
  background: var(--color-accent); color: white;
  border-radius: 50%; font-size: 0.6rem;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.users-list { display: flex; flex-direction: column; gap: 0.5rem; }
.user-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-radius: var(--radius-sm); background: var(--color-surface-2); }
.user-row-left { display: flex; align-items: center; gap: 0.625rem; }
.user-avatar-md { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; color: white; flex-shrink: 0; }
.user-row-actions { display: flex; gap: 0.125rem; }
.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.color-swatches { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.color-swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: border-color 0.15s; }
.color-swatch.selected { border-color: var(--color-text); }
.color-swatch:hover { transform: scale(1.1); }
</style>
