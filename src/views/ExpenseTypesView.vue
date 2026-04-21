<template>
  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Categories</h1>
        <p class="text-secondary text-sm">Expense types & last 30 days summary</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ New</button>
    </div>

    <!-- Chart type selector -->
    <div class="section-label">Analytics — Last 30 days</div>
    <div class="tab-bar chart-tabs" style="max-width:320px; margin-bottom: 1rem;">
      <button class="tab-item" :class="{ active: chartType === 'doughnut' }" @click="chartType = 'doughnut'">🍩 Doughnut</button>
      <button class="tab-item" :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'">📊 Bar</button>
      <button class="tab-item" :class="{ active: chartType === 'line' }" @click="chartType = 'line'">📈 Line</button>
    </div>

    <!-- Chart card -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div v-if="hasData" class="chart-container">
        <Doughnut v-if="chartType === 'doughnut'" :data="doughnutData" :options="doughnutOptions" />
        <Bar v-else-if="chartType === 'bar'" :data="barData" :options="barOptions" />
        <Line v-else :data="lineData" :options="lineOptions" />
      </div>
      <div v-else class="empty-state" style="padding: 2rem;">
        <div class="empty-state-icon">📊</div>
        <h3>No expense data yet</h3>
        <p class="text-sm">Add expenses to see your spending breakdown.</p>
      </div>

      <!-- Legend / summary -->
      <div v-if="hasData && chartType === 'doughnut'" class="chart-legend">
        <div v-for="item in legendItems" :key="item.id" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          <span class="legend-name text-sm">{{ item.icon }} {{ item.name }}</span>
          <span class="legend-amount text-sm font-semibold">${{ item.total.toFixed(2) }}</span>
        </div>
      </div>

      <div class="chart-total text-sm text-secondary" v-if="hasData">
        Total: <strong>${{ totalLastMonth.toFixed(2) }}</strong> in the last 30 days
      </div>
    </div>

    <!-- Categories list -->
    <div class="section-label">Your categories</div>
    <div class="types-list">
      <div v-for="type in typesStore.types" :key="type.id" class="type-item card-flat">
        <div class="type-left">
          <div class="type-icon" :style="{ background: type.color + '20' }">{{ type.icon }}</div>
          <div>
            <div class="font-medium">{{ type.name }}</div>
            <div class="text-xs text-muted">{{ getCount(type.id) }} expense(s) this month</div>
          </div>
        </div>
        <div class="type-right">
          <span class="type-total">${{ getTotal(type.id).toFixed(2) }}</span>
          <div class="type-actions">
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(type)">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" @click="confirmDeleteType(type.id)">🗑️</button>
          </div>
        </div>
      </div>
      <div v-if="!typesStore.types.length" class="empty-state">
        <div class="empty-state-icon">🏷️</div>
        <h3>No categories yet</h3>
        <p class="text-sm">Create categories to organize your expenses.</p>
      </div>
    </div>

    <!-- Add/Edit modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingType ? 'Edit category' : 'New category' }}</h2>
            <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-fields">
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input v-model="form.name" class="form-input" placeholder="e.g. Food & Dining" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Icon (emoji)</label>
                  <input v-model="form.icon" class="form-input" placeholder="🍽️" maxlength="4" />
                </div>
                <div class="form-group">
                  <label class="form-label">Color</label>
                  <div class="color-picker-row">
                    <input v-model="form.color" class="form-input color-input" type="color" />
                    <span class="color-preview" :style="{ background: form.color }"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" @click="saveType">{{ editingType ? 'Save' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div v-if="confirmDeleteId" class="modal-backdrop" @click.self="confirmDeleteId = null">
        <div class="modal" style="max-width:360px">
          <div class="modal-header"><h3>Delete category?</h3></div>
          <div class="modal-body"><p class="text-secondary">Expenses with this category will remain but become uncategorized.</p></div>
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
import { ref, reactive, computed, watch } from 'vue'
import { useExpenseTypesStore } from '@/stores/expenseTypes'
import { useEntriesStore } from '@/stores/entries'
import { useThemeStore } from '@/stores/theme'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

const typesStore = useExpenseTypesStore()
const entriesStore = useEntriesStore()
const themeStore = useThemeStore()

const chartType = ref('doughnut')
const showModal = ref(false)
const editingType = ref(null)
const confirmDeleteId = ref(null)

const form = reactive({ name: '', icon: '💰', color: '#2d6a4f' })

// Read accent color from CSS variables at runtime so charts update with theme
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const accentColor = ref(getCSSVar('--color-accent'))
const accentLightColor = ref(getCSSVar('--color-accent-light'))

// Re-read CSS vars whenever theme changes
watch(() => themeStore.activeId, () => {
  setTimeout(() => {
    accentColor.value = getCSSVar('--color-accent')
    accentLightColor.value = getCSSVar('--color-accent-light')
  }, 50) // small delay so CSS vars are applied first
})

const lastMonthExpenses = computed(() => entriesStore.getLastMonthExpenses())
const hasData = computed(() => lastMonthExpenses.value.length > 0)
const totalLastMonth = computed(() => lastMonthExpenses.value.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0))

const legendItems = computed(() =>
  typesStore.types
    .map(t => ({ ...t, total: getTotal(t.id) }))
    .filter(t => t.total > 0)
    .sort((a, b) => b.total - a.total)
)

const doughnutData = computed(() => ({
  labels: legendItems.value.map(t => t.name),
  datasets: [{
    data: legendItems.value.map(t => t.total),
    backgroundColor: legendItems.value.map(t => t.color + 'cc'),
    borderColor: legendItems.value.map(t => t.color),
    borderWidth: 2,
  }]
}))
const doughnutOptions = { responsive: true, plugins: { legend: { display: false } } }

const barData = computed(() => ({
  labels: legendItems.value.map(t => `${t.icon} ${t.name}`),
  datasets: [{
    label: 'Spent ($)',
    data: legendItems.value.map(t => t.total),
    backgroundColor: legendItems.value.map(t => t.color + 'bb'),
    borderColor: legendItems.value.map(t => t.color),
    borderWidth: 1,
    borderRadius: 6,
  }]
}))
const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

// Line chart: daily total spend over last 14 days — uses theme accent color
const lineData = computed(() => {
  const days = []
  const totals = []
  for (let i = 13; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day')
    const ds = d.format('YYYY-MM-DD')
    days.push(d.format('M/D'))
    const total = lastMonthExpenses.value
      .filter(e => e.date === ds)
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    totals.push(total)
  }
  return {
    labels: days,
    datasets: [{
      label: 'Daily spend ($)',
      data: totals,
      borderColor: accentColor.value,
      backgroundColor: accentLightColor.value + '66',
      borderWidth: 2,
      pointBackgroundColor: accentColor.value,
      tension: 0.3,
      fill: true,
    }]
  }
})
const lineOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

function getTotal(typeId) { return entriesStore.getLastMonthByType(typeId) }
function getCount(typeId) {
  return lastMonthExpenses.value.filter(e => e.expenseTypeId === typeId).length
}

function openAdd() {
  editingType.value = null
  Object.assign(form, { name: '', icon: '💰', color: getCSSVar('--color-accent') || '#2d6a4f' })
  showModal.value = true
}
function openEdit(type) {
  editingType.value = type
  Object.assign(form, { name: type.name, icon: type.icon, color: type.color })
  showModal.value = true
}
function closeModal() { showModal.value = false; editingType.value = null }
function saveType() {
  if (!form.name) return
  if (editingType.value) {
    typesStore.updateType(editingType.value.id, { ...form })
  } else {
    typesStore.addType({ ...form })
  }
  closeModal()
}
function confirmDeleteType(id) { confirmDeleteId.value = id }
function doDelete() { typesStore.deleteType(confirmDeleteId.value); confirmDeleteId.value = null }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
.page-header h1 { margin-bottom: 0.25rem; }
.section-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 0.625rem; }
.chart-container { height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.chart-container canvas { max-height: 220px !important; }
.chart-legend { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; }
.legend-amount { color: var(--color-text); }
.chart-total { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border); }
.types-list { display: flex; flex-direction: column; gap: 0.5rem; }
.type-item { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.type-left { display: flex; align-items: center; gap: 0.75rem; }
.type-icon { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.type-right { display: flex; align-items: center; gap: 0.5rem; }
.type-total { font-weight: 600; color: var(--color-expense); min-width: 60px; text-align: right; }
.type-actions { display: flex; gap: 0.125rem; opacity: 0; transition: opacity var(--transition); }
.type-item:hover .type-actions { opacity: 1; }
.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.color-picker-row { display: flex; align-items: center; gap: 0.5rem; }
.color-input { width: 50px; padding: 0.25rem; height: 40px; cursor: pointer; }
.color-preview { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--color-border); }
</style>