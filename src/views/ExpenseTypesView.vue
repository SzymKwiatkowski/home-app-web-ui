<template>
  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Categories</h1>
        <p class="text-secondary text-sm">Manage types for expenses, incomes &amp; events</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ New</button>
    </div>

    <!-- Entry-type tab switcher -->
    <div class="tab-bar entry-type-tabs" style="margin-bottom:1.25rem">
      <button v-for="tab in tabs" :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span>{{ tab.icon }}</span> {{ tab.label }}
      </button>
    </div>

    <!-- ── Analytics (expenses & incomes only) ── -->
    <template v-if="activeTab !== 'event'">
      <div class="section-label">Analytics — Last 30 days</div>
      <div class="tab-bar chart-tabs" style="max-width:320px; margin-bottom:1rem">
        <button class="tab-item" :class="{ active: chartType==='doughnut' }" @click="chartType='doughnut'">🍩 Doughnut</button>
        <button class="tab-item" :class="{ active: chartType==='bar'      }" @click="chartType='bar'">📊 Bar</button>
        <button class="tab-item" :class="{ active: chartType==='line'     }" @click="chartType='line'">📈 Line</button>
      </div>

      <div class="card" style="margin-bottom:1.5rem">
        <div v-if="hasData" class="chart-container">
          <Doughnut v-if="chartType==='doughnut'" :data="doughnutData" :options="doughnutOptions" />
          <Bar      v-else-if="chartType==='bar'" :data="barData"      :options="barOptions" />
          <Line     v-else                        :data="lineData"     :options="lineOptions" />
        </div>
        <div v-else class="empty-state" style="padding:2rem">
          <div class="empty-state-icon">{{ activeTab === 'income' ? '💚' : '📊' }}</div>
          <h3>No {{ activeTab }} data yet</h3>
          <p class="text-sm">Add {{ activeTab }}s to see your breakdown.</p>
        </div>

        <div v-if="hasData && chartType==='doughnut'" class="chart-legend">
          <div v-for="item in legendItems" :key="item.id" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-name text-sm">{{ item.icon }} {{ item.name }}</span>
            <span class="legend-amount text-sm font-semibold">{{ currencyStore.format(item.total) }}</span>
          </div>
        </div>
        <div v-if="hasData" class="chart-total text-sm text-secondary">
          Total: <strong>{{ currencyStore.format(totalLastPeriod) }}</strong> in the last 30 days
        </div>
      </div>
    </template>

    <!-- ── Category list ── -->
    <div class="section-label">
      {{ currentTab.label }} categories
      <span class="badge badge-neutral" style="margin-left:0.5rem">{{ activeTypes.length }}</span>
    </div>

    <div class="types-list">
      <div v-for="type in activeTypes" :key="type.id" class="type-item card-flat">
        <div class="type-left">
          <div class="type-icon" :style="{ background: type.color + '22' }">{{ type.icon }}</div>
          <div>
            <div class="font-medium">{{ type.name }}</div>
            <div class="text-xs text-muted">{{ getCount(type) }} entr{{ getCount(type) === 1 ? 'y' : 'ies' }} this month</div>
          </div>
        </div>
        <div class="type-right">
          <span v-if="activeTab !== 'event'" class="type-total" :class="activeTab">
            {{ activeTab === 'income' ? '+' : '−' }}{{ currencyStore.format(getTotal(type)) }}
          </span>
          <div class="type-actions">
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(type)">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" @click="confirmDeleteId = type.id">🗑️</button>
          </div>
        </div>
      </div>
      <div v-if="!activeTypes.length" class="empty-state">
        <div class="empty-state-icon">{{ currentTab.icon }}</div>
        <h3>No {{ currentTab.label.toLowerCase() }} categories</h3>
        <p class="text-sm">Create categories to organise your {{ currentTab.label.toLowerCase() }}s.</p>
        <button class="btn btn-primary" style="margin-top:1rem" @click="openAdd">Add category</button>
      </div>
    </div>

    <!-- ── Add / Edit modal ── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingType ? 'Edit category' : 'New category' }}</h2>
            <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-fields">

              <!-- Entry-type selector (only when creating) -->
              <div class="form-group" v-if="!editingType">
                <label class="form-label">Applies to</label>
                <div class="type-selector">
                  <button v-for="tab in tabs" :key="tab.value"
                    type="button"
                    class="type-btn"
                    :class="[`type-btn--${tab.value}`, { active: form.entryType === tab.value }]"
                    @click="form.entryType = tab.value"
                  >
                    {{ tab.icon }} {{ tab.label }}
                  </button>
                </div>
              </div>
              <div v-else class="form-group">
                <label class="form-label">Applies to</label>
                <div class="readonly-type-chip" :class="`chip--${editingType.entryType}`">
                  {{ tabs.find(t=>t.value===editingType.entryType)?.icon }}
                  {{ tabs.find(t=>t.value===editingType.entryType)?.label }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Name *</label>
                <input v-model="form.name" class="form-input" placeholder="e.g. Food & Dining" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Icon (emoji)</label>
                  <div class="icon-picker-row">
                    <EmojiPicker v-model="form.icon" />
                    <span class="icon-preview" :style="{ background: form.color + '22' }">{{ form.icon || '?' }}</span>
                  </div>
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
          <div class="modal-body"><p class="text-secondary">Entries with this category will remain but become uncategorized.</p></div>
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
import { useEntryTypesStore } from '@/stores/entryTypes'
import { useEntriesStore } from '@/stores/entries'
import { useThemeStore } from '@/stores/theme'
import { useCurrencyStore } from '@/stores/currency'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js'
import EmojiPicker from '@/components/EmojiPicker.vue'
import dayjs from 'dayjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

const typesStore    = useEntryTypesStore()
const entriesStore  = useEntriesStore()
const themeStore    = useThemeStore()
const currencyStore = useCurrencyStore()

// ── Tabs ──────────────────────────────────────────────────────────
const tabs = [
  { value: 'expense', label: 'Expenses', icon: '💸' },
  { value: 'income',  label: 'Incomes',  icon: '💚' },
  { value: 'event',   label: 'Events',   icon: '📅' },
]
const activeTab = ref('expense')
const currentTab = computed(() => tabs.find(t => t.value === activeTab.value))

const activeTypes = computed(() => typesStore.forEntryType(activeTab.value))

// ── State ─────────────────────────────────────────────────────────
const chartType     = ref('doughnut')
const showModal     = ref(false)
const editingType   = ref(null)
const confirmDeleteId = ref(null)

const form = reactive({ entryType: 'expense', name: '', icon: '💰', color: '#2d6a4f' })

// ── CSS var helpers for chart colours ─────────────────────────────
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
const accentColor      = ref(getCSSVar('--color-accent'))
const accentLightColor = ref(getCSSVar('--color-accent-light'))
watch(() => themeStore.activeId, () => {
  setTimeout(() => {
    accentColor.value      = getCSSVar('--color-accent')
    accentLightColor.value = getCSSVar('--color-accent-light')
  }, 50)
})

// ── Stats helpers ─────────────────────────────────────────────────
const thisMonth = dayjs().format('YYYY-MM')

function getCount(type) {
  return entriesStore.entries.filter(e =>
    e.type === type.entryType &&
    e.categoryId === type.id &&
    e.date.startsWith(thisMonth)
  ).length
}

function getTotal(type) {
  if (type.entryType === 'event') return 0
  const fn = type.entryType === 'income'
    ? entriesStore.getLastMonthByIncomeCat
    : entriesStore.getLastMonthByCategory
  return fn(type.id)
}

// ── Analytics data (expenses or incomes) ─────────────────────────
const lastPeriodEntries = computed(() =>
  activeTab.value === 'income'
    ? entriesStore.getLastMonthIncomes()
    : entriesStore.getLastMonthExpenses()
)
const hasData = computed(() => lastPeriodEntries.value.length > 0)
const totalLastPeriod = computed(() =>
  lastPeriodEntries.value.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
)

const legendItems = computed(() =>
  activeTypes.value
    .map(t => ({ ...t, total: getTotal(t) }))
    .filter(t => t.total > 0)
    .sort((a, b) => b.total - a.total)
)

const doughnutData = computed(() => ({
  labels: legendItems.value.map(t => t.name),
  datasets: [{
    data: legendItems.value.map(t => t.total),
    backgroundColor: legendItems.value.map(t => t.color + 'cc'),
    borderColor:     legendItems.value.map(t => t.color),
    borderWidth: 2,
  }],
}))
const doughnutOptions = { responsive: true, plugins: { legend: { display: false } } }

const barData = computed(() => ({
  labels: legendItems.value.map(t => `${t.icon} ${t.name}`),
  datasets: [{
    label: 'Amount',
    data: legendItems.value.map(t => t.total),
    backgroundColor: legendItems.value.map(t => t.color + 'bb'),
    borderColor:     legendItems.value.map(t => t.color),
    borderWidth: 1, borderRadius: 6,
  }],
}))
const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

const lineData = computed(() => {
  const days = [], totals = []
  for (let i = 13; i >= 0; i--) {
    const d  = dayjs().subtract(i, 'day')
    const ds = d.format('YYYY-MM-DD')
    days.push(d.format('M/D'))
    totals.push(
      lastPeriodEntries.value
        .filter(e => e.date === ds)
        .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    )
  }
  return {
    labels: days,
    datasets: [{
      label: 'Daily amount',
      data: totals,
      borderColor: accentColor.value,
      backgroundColor: accentLightColor.value + '66',
      borderWidth: 2,
      pointBackgroundColor: accentColor.value,
      tension: 0.3, fill: true,
    }],
  }
})
const lineOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }

// ── CRUD ──────────────────────────────────────────────────────────
function openAdd() {
  editingType.value = null
  Object.assign(form, {
    entryType: activeTab.value,
    name: '',
    icon: activeTab.value === 'income' ? '💚' : activeTab.value === 'event' ? '📅' : '💰',
    color: getCSSVar('--color-accent') || '#2d6a4f',
  })
  showModal.value = true
}

function openEdit(type) {
  editingType.value = type
  Object.assign(form, { entryType: type.entryType, name: type.name, icon: type.icon, color: type.color })
  showModal.value = true
}

function closeModal() { showModal.value = false; editingType.value = null }

function saveType() {
  if (!form.name) return
  if (editingType.value) {
    typesStore.updateType(editingType.value.id, { name: form.name, icon: form.icon, color: form.color })
  } else {
    typesStore.addType({ entryType: form.entryType, name: form.name, icon: form.icon, color: form.color })
    activeTab.value = form.entryType   // switch to newly created tab
  }
  closeModal()
}

function doDelete() { typesStore.deleteType(confirmDeleteId.value); confirmDeleteId.value = null }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
.page-header h1 { margin-bottom: 0.25rem; }
.section-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 0.625rem; display: flex; align-items: center; }

/* Tabs */
.entry-type-tabs { max-width: 100%; }

/* Chart */
.chart-container { height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.chart-container canvas { max-height: 220px !important; }
.chart-legend { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-name { flex: 1; }
.chart-total { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border); }

/* Types list */
.types-list { display: flex; flex-direction: column; gap: 0.5rem; }
.type-item { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.type-left { display: flex; align-items: center; gap: 0.75rem; }
.type-icon { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.type-right { display: flex; align-items: center; gap: 0.5rem; }
.type-total { font-weight: 600; min-width: 80px; text-align: right; }
.type-total.expense { color: var(--color-expense); }
.type-total.income  { color: var(--color-accent); }
.type-actions { display: flex; gap: 0.125rem; opacity: 0; transition: opacity var(--transition); }
.type-item:hover .type-actions { opacity: 1; }

/* Modal */
.form-fields { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

/* Entry-type selector inside modal */
.type-selector { display: flex; gap: 0.5rem; }
.type-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.375rem;
  padding: 0.5rem 0.25rem; border: 2px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 0.8125rem; font-weight: 500;
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition); background: var(--color-surface-2);
}
.type-btn:hover { border-color: var(--color-border-strong); }
.type-btn--expense.active { border-color: var(--color-expense);  background: var(--color-danger-light);  color: var(--color-expense); }
.type-btn--income.active  { border-color: var(--color-accent);   background: var(--color-accent-light);  color: var(--color-accent); }
.type-btn--event.active   { border-color: var(--color-text);     background: var(--color-surface-2);     color: var(--color-text); }

/* Read-only chip when editing */
.readonly-type-chip {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.75rem; border-radius: 999px;
  font-size: 0.875rem; font-weight: 500;
  border: 1px solid var(--color-border);
}
.chip--expense { background: var(--color-danger-light);  color: var(--color-expense); }
.chip--income  { background: var(--color-accent-light);  color: var(--color-accent); }
.chip--event   { background: var(--color-surface-2);     color: var(--color-text-secondary); }

/* Icon + color pickers */
.icon-picker-row { display: flex; align-items: center; gap: 0.625rem; }
.icon-preview { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.375rem; flex-shrink: 0; border: 1px solid var(--color-border); }
.color-picker-row { display: flex; align-items: center; gap: 0.5rem; }
.color-input { width: 50px; padding: 0.25rem; height: 40px; cursor: pointer; }
.color-preview { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--color-border); }
</style>