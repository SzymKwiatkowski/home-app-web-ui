<template>
  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Scheduled</h1>
        <p class="text-secondary text-sm">Entries added automatically by the backend</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ New</button>
    </div>

    <!-- Summary chips -->
    <div class="sched-summary">
      <div class="sum-chip">
        <span class="sum-num">{{ activeCount }}</span>
        <span class="text-xs text-muted">Active</span>
      </div>
      <div class="sum-chip">
        <span class="sum-num">{{ inactiveCount }}</span>
        <span class="text-xs text-muted">Paused</span>
      </div>
      <div class="sum-chip">
        <span class="sum-num income-color">+{{ currencyStore.format(monthlyIncomeSched) }}</span>
        <span class="text-xs text-muted">Scheduled income/mo</span>
      </div>
      <div class="sum-chip">
        <span class="sum-num expense-color">−{{ currencyStore.format(monthlyExpenseSched) }}</span>
        <span class="text-xs text-muted">Scheduled expenses/mo</span>
      </div>
    </div>

    <!-- List -->
    <div v-if="scheduledStore.items.length" class="sched-list">
      <div v-for="item in scheduledStore.items" :key="item.id" class="sched-card card-flat" :class="{ paused: !item.active }">
        <div class="sched-left">
          <div class="sched-icon" :class="item.type">
            {{ item.type === 'income' ? '💚' : item.type === 'event' ? '📅' : '💸' }}
          </div>
          <div class="sched-info">
            <div class="sched-name font-medium">{{ item.name }}</div>
            <div class="sched-meta text-xs text-muted">
              <span class="recurrence-badge badge badge-neutral">{{ recurrenceLabel(item.recurrence) }}</span>
              <span v-if="item.dayOfMonth">· Day {{ item.dayOfMonth }}</span>
              <span>· {{ item.time }}</span>
            </div>
            <div v-if="item.description" class="sched-desc text-sm text-secondary">{{ item.description }}</div>
            <div v-if="item.assignedUserIds && item.assignedUserIds.length" class="sched-users">
              <span
                v-for="uid in item.assignedUserIds" :key="uid"
                class="user-avatar-xs"
                :style="{ background: usersStore.getColor(uid) }"
                :title="usersStore.getById(uid)?.name"
              >{{ usersStore.getAvatar(uid) }}</span>
            </div>
            <div v-if="item.nextRun" class="next-run text-xs">
              <span class="text-muted">Next run:</span>
              <span class="font-medium" :class="item.active ? 'text-accent' : 'text-muted'">
                {{ formatDate(item.nextRun) }}
              </span>
            </div>
          </div>
        </div>
        <div class="sched-right">
          <div v-if="item.amount" class="sched-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '−' }}{{ currencyStore.format(item.amount, item.currency) }}
          </div>
          <div class="sched-actions">
            <button
              class="btn btn-sm"
              :class="item.active ? 'btn-secondary' : 'btn-accent'"
              @click="scheduledStore.toggle(item.id)"
              :title="item.active ? 'Pause' : 'Activate'"
            >
              {{ item.active ? '⏸ Pause' : '▶ Activate' }}
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(item)">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" @click="confirmDeleteId = item.id">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">⏰</div>
      <h3>No scheduled entries</h3>
      <p class="text-sm">Create templates for recurring expenses, incomes or events.</p>
      <button class="btn btn-primary" style="margin-top:1rem" @click="openAdd">Add first schedule</button>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingItem ? 'Edit schedule' : 'New schedule' }}</h2>
            <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-fields">
              <!-- Type -->
              <div class="form-group">
                <label class="form-label">Type</label>
                <div class="type-selector">
                  <button class="type-btn" :class="{ active: form.type === 'expense' }" @click="form.type = 'expense'">💸 Expense</button>
                  <button class="type-btn income" :class="{ active: form.type === 'income' }" @click="form.type = 'income'">💚 Income</button>
                  <button class="type-btn" :class="{ active: form.type === 'event' }" @click="form.type = 'event'">📅 Event</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Name *</label>
                <input v-model="form.name" class="form-input" placeholder="e.g. Monthly salary, Netflix..." />
              </div>

              <div class="form-row" v-if="form.type !== 'event'">
                <div class="form-group">
                  <label class="form-label">Amount</label>
                  <div class="amount-input">
                    <span class="currency-symbol">{{ currencyStore.getSymbol(form.currency) }}</span>
                    <input v-model.number="form.amount" class="form-input" type="number" min="0" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Currency</label>
                  <select v-model="form.currency" class="form-select">
                    <option v-for="c in currencyStore.currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.symbol }}</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Recurrence *</label>
                  <select v-model="form.recurrence" class="form-select">
                    <option v-for="r in RECURRENCE_OPTIONS" :key="r.value" :value="r.value">{{ r.label }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Day of month</label>
                  <input v-model.number="form.dayOfMonth" class="form-input" type="number" min="1" max="28" placeholder="1–28" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Time</label>
                <input v-model="form.time" class="form-input" type="time" />
              </div>

              <div v-if="form.type === 'expense'" class="form-group">
                <label class="form-label">Category</label>
                <select v-model="form.expenseTypeId" class="form-select">
                  <option value="">None</option>
                  <option v-for="t in typesStore.types" :key="t.id" :value="t.id">{{ t.icon }} {{ t.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Assigned to</label>
                <UserPicker v-model="form.assignedUserIds" />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" class="form-textarea" placeholder="Optional notes..." />
              </div>

              <div class="form-group">
                <label class="toggle-label">
                  <input type="checkbox" v-model="form.active" class="toggle-input" />
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  <span class="font-medium">Active</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" @click="saveItem">{{ editingItem ? 'Save' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal" style="max-width:360px">
          <div class="modal-header"><h3>Delete schedule?</h3></div>
          <div class="modal-body"><p class="text-secondary">This won't affect already-created entries.</p></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="confirmDeleteId = null">Cancel</button>
            <button class="btn btn-danger" @click="doDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useScheduledStore, RECURRENCE_OPTIONS } from '@/stores/scheduled'
import UserPicker from '@/components/UserPicker.vue'
import { useExpenseTypesStore } from '@/stores/expenseTypes'
import { useCurrencyStore } from '@/stores/currency'
import { useUsersStore } from '@/stores/users'
import dayjs from 'dayjs'

const scheduledStore = useScheduledStore()
const typesStore = useExpenseTypesStore()
const currencyStore = useCurrencyStore()
const usersStore = useUsersStore()

const showModal = ref(false)
const editingItem = ref(null)
const confirmDeleteId = ref(null)

const form = reactive({ type: 'expense', name: '', amount: '', currency: currencyStore.defaultCode, recurrence: 'monthly', dayOfMonth: 1, time: '08:00', expenseTypeId: '', description: '', active: true, assignedUserIds: [1] })

const activeCount = computed(() => scheduledStore.items.filter(i => i.active).length)
const inactiveCount = computed(() => scheduledStore.items.filter(i => !i.active).length)

const monthlyExpenseSched = computed(() =>
  scheduledStore.items.filter(i => i.active && i.type === 'expense' && i.recurrence === 'monthly')
    .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
)
const monthlyIncomeSched = computed(() =>
  scheduledStore.items.filter(i => i.active && i.type === 'income' && i.recurrence === 'monthly')
    .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
)

function recurrenceLabel(val) { return RECURRENCE_OPTIONS.find(r => r.value === val)?.label || val }
function formatDate(date) {
  const d = dayjs(date)
  return d.isSame(dayjs(), 'day') ? 'Today' : d.format('MMM D, YYYY')
}

function openAdd() {
  editingItem.value = null
  Object.assign(form, { type: 'expense', name: '', amount: '', currency: currencyStore.defaultCode, recurrence: 'monthly', dayOfMonth: 1, time: '08:00', expenseTypeId: '', description: '', active: true, assignedUserIds: [1] })
  showModal.value = true
}
function openEdit(item) {
  editingItem.value = item
  Object.assign(form, { ...item })
  showModal.value = true
}
function closeModal() { showModal.value = false; editingItem.value = null }

function saveItem() {
  if (!form.name || !form.recurrence) return
  const data = {
    type: form.type,
    name: form.name,
    amount: form.type !== 'event' ? parseFloat(form.amount) || null : null,
    currency: form.type !== 'event' ? form.currency : null,
    recurrence: form.recurrence,
    dayOfMonth: form.dayOfMonth || null,
    time: form.time,
    expenseTypeId: form.type === 'expense' ? form.expenseTypeId || null : null,
    description: form.description,
    assignedUserIds: form.assignedUserIds || [1],
    active: form.active,
    nextRun: form.dayOfMonth ? computeNextRun(form.dayOfMonth) : null,
  }
  if (editingItem.value) {
    scheduledStore.update(editingItem.value.id, data)
  } else {
    scheduledStore.add(data)
  }
  closeModal()
}

function computeNextRun(day) {
  const today = dayjs()
  let next = today.date(day)
  if (next.isBefore(today, 'day')) next = next.add(1, 'month')
  return next.format('YYYY-MM-DD')
}

function doDelete() { scheduledStore.remove(confirmDeleteId.value); confirmDeleteId.value = null }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; gap: 1rem; }
.page-header h1 { margin-bottom: 0.2rem; }

.sched-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.625rem; margin-bottom: 1.5rem; }
.sum-chip { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
.sum-num { font-weight: 700; font-size: 1rem; color: var(--color-text); }
.income-color { color: var(--color-accent) !important; }
.expense-color { color: var(--color-expense) !important; }

.sched-list { display: flex; flex-direction: column; gap: 0.625rem; }
.sched-card { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; transition: opacity var(--transition); }
.sched-card.paused { opacity: 0.55; }
.sched-left { display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 0; }
.sched-icon { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; background: var(--color-surface-2); }
.sched-icon.income { background: var(--color-accent-light); }
.sched-icon.expense { background: var(--color-danger-light); }
.sched-info { flex: 1; min-width: 0; }
.sched-name { font-size: 0.9375rem; }
.sched-meta { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.2rem; flex-wrap: wrap; }
.sched-desc { margin-top: 0.2rem; }
.next-run { margin-top: 0.3rem; display: flex; gap: 0.375rem; }
.sched-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
.sched-amount { font-weight: 700; font-size: 0.9375rem; }
.sched-amount.income { color: var(--color-accent); }
.sched-amount.expense { color: var(--color-expense); }
.sched-actions { display: flex; gap: 0.25rem; align-items: center; }

/* Type selector in modal */
.type-selector { display: flex; gap: 0.5rem; }
.type-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem 0.25rem; border: 2px solid var(--color-border); border-radius: var(--radius-md);
  font-size: 0.8rem; font-weight: 500; color: var(--color-text-secondary);
  cursor: pointer; transition: all var(--transition); background: var(--color-surface-2);
}
.type-btn.active { border-color: var(--color-text); background: var(--color-text); color: var(--color-bg); }
.type-btn.income.active { border-color: var(--color-accent); background: var(--color-accent); color: white; }

.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.amount-input { position: relative; }
.currency-symbol {
  position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
  color: var(--color-text-secondary); font-weight: 500; pointer-events: none; font-size: 0.875rem;
}
.amount-input .form-input { padding-left: 2rem; }

/* Toggle switch */
.toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
.toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-track {
  width: 42px; height: 24px; background: var(--color-border);
  border-radius: 999px; position: relative; transition: background var(--transition); flex-shrink: 0;
}
.toggle-input:checked + .toggle-track { background: var(--color-accent); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: white; box-shadow: var(--shadow-sm);
  transition: transform var(--transition);
}
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }
.sched-users { display: flex; gap: 0.25rem; margin-top: 0.3rem; }
.user-avatar-xs { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: white; }
</style>