<template>
  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Summaries</h1>
        <p class="text-secondary text-sm">Monthly financial overview</p>
      </div>
    </div>

    <!-- Month selector -->
    <div class="month-nav">
      <button class="btn btn-ghost btn-icon" @click="prevMonth">‹</button>
      <div class="month-title">
        <span class="display">{{ monthLabel }}</span>
        <span class="text-xs text-muted" v-if="isCurrentMonth">Current month</span>
      </div>
      <button class="btn btn-ghost btn-icon" :disabled="isCurrentMonth" @click="nextMonth">›</button>
    </div>

    <!-- Balance card -->
    <div class="balance-card card" :class="summary.balance >= 0 ? 'positive' : 'negative'">
      <div class="balance-row">
        <div class="balance-item">
          <div class="balance-label text-xs">Total income</div>
          <div class="balance-val income">+{{ currencyStore.format(summary.totalIncomes) }}</div>
        </div>
        <div class="balance-minus">−</div>
        <div class="balance-item">
          <div class="balance-label text-xs">Total expenses</div>
          <div class="balance-val expense">{{ currencyStore.format(summary.totalExpenses) }}</div>
        </div>
        <div class="balance-equals">=</div>
        <div class="balance-item">
          <div class="balance-label text-xs">Balance</div>
          <div class="balance-val" :class="summary.balance >= 0 ? 'income' : 'expense'">
            {{ summary.balance >= 0 ? '+' : '' }}{{ currencyStore.format(summary.balance) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filters bar -->
    <div class="filters-bar">
      <div class="filter-group">
        <span class="filter-group-label text-xs text-muted">Show</span>
        <div class="type-filter">
          <button v-for="f in typeFilters" :key="f.value" class="filter-chip" :class="{ active: activeTypeFilter === f.value }" @click="activeTypeFilter = f.value">
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="filter-group" v-if="activeTypeFilter === 'expense'">
        <span class="filter-group-label text-xs text-muted">Category</span>
        <select v-model="activeCategoryFilter" class="form-select filter-select">
          <option value="">All categories</option>
          <option v-for="t in typesStore.types" :key="t.id" :value="t.id">{{ t.icon }} {{ t.name }}</option>
        </select>
      </div>
    </div>

    <!-- Summary sections -->
    <div class="summary-sections">

      <!-- Incomes section -->
      <template v-if="activeTypeFilter === 'all' || activeTypeFilter === 'income'">
        <div class="section-header">
          <div class="section-title">
            <span>💚 Incomes</span>
            <span class="badge badge-income">{{ filteredIncomes.length }}</span>
          </div>
          <span class="section-total income-color">+{{ currencyStore.format(incomesTotal) }}</span>
        </div>
        <div v-if="filteredIncomes.length" class="entry-group">
          <div v-for="entry in filteredIncomes" :key="entry.id" class="summary-row card-flat">
            <div class="summary-row-left">
              <div class="sum-icon income-icon">💚</div>
              <div>
                <div class="font-medium text-sm">{{ entry.name }}</div>
                <div class="text-xs text-muted">{{ formatDate(entry.date, entry.time) }}</div>
                <div v-if="entry.description" class="text-xs text-secondary">{{ entry.description }}</div>
              </div>
            </div>
            <div class="sum-amount income-color">+{{ currencyStore.format(entry.amount, entry.currency) }}</div>
          </div>
        </div>
        <div v-else class="no-data text-muted text-sm">No incomes recorded for this month.</div>
      </template>

      <!-- Expenses section -->
      <template v-if="activeTypeFilter === 'all' || activeTypeFilter === 'expense'">
        <div class="section-header" style="margin-top: 1.25rem;">
          <div class="section-title">
            <span>💸 Expenses</span>
            <span class="badge badge-expense">{{ filteredExpenses.length }}</span>
          </div>
          <span class="section-total expense-color">−{{ currencyStore.format(expensesTotal) }}</span>
        </div>

        <!-- Category breakdown (when showing all expenses) -->
        <div v-if="!activeCategoryFilter && filteredExpenses.length" class="category-breakdown">
          <div v-for="cat in categoryBreakdown" :key="cat.id" class="cat-row">
            <div class="cat-left">
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="text-sm font-medium">{{ cat.name }}</span>
              <span class="badge badge-neutral">{{ cat.count }}</span>
            </div>
            <div class="cat-bar-wrap">
              <div class="cat-bar" :style="{ width: cat.pct + '%', background: cat.color }"></div>
            </div>
            <span class="cat-amount expense-color text-sm font-semibold">{{ currencyStore.format(cat.total) }}</span>
          </div>
        </div>

        <div v-if="filteredExpenses.length" class="entry-group">
          <div v-for="entry in filteredExpenses" :key="entry.id" class="summary-row card-flat">
            <div class="summary-row-left">
              <div class="sum-icon" :style="{ background: getCatColor(entry.expenseTypeId) }">
                {{ getCatIcon(entry.expenseTypeId) }}
              </div>
              <div>
                <div class="font-medium text-sm">{{ entry.name }}</div>
                <div class="text-xs text-muted">
                  {{ formatDate(entry.date, entry.time) }}
                  <span v-if="getCatName(entry.expenseTypeId)"> · {{ getCatName(entry.expenseTypeId) }}</span>
                </div>
                <div v-if="entry.description" class="text-xs text-secondary">{{ entry.description }}</div>
              </div>
            </div>
            <div class="sum-amount expense-color">−{{ currencyStore.format(entry.amount, entry.currency) }}</div>
          </div>
        </div>
        <div v-else class="no-data text-muted text-sm">No expenses recorded for this month.</div>
      </template>

      <!-- Events section -->
      <template v-if="activeTypeFilter === 'all' || activeTypeFilter === 'event'">
        <div class="section-header" style="margin-top: 1.25rem;">
          <div class="section-title">
            <span>📅 Events</span>
            <span class="badge badge-event">{{ summary.events.length }}</span>
          </div>
        </div>
        <div v-if="summary.events.length" class="entry-group">
          <div v-for="entry in summary.events" :key="entry.id" class="summary-row card-flat">
            <div class="summary-row-left">
              <div class="sum-icon event-icon">📅</div>
              <div>
                <div class="font-medium text-sm">{{ entry.name }}</div>
                <div class="text-xs text-muted">{{ formatDate(entry.date, entry.time) }}</div>
                <div v-if="entry.description" class="text-xs text-secondary">{{ entry.description }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data text-muted text-sm">No events recorded for this month.</div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { useExpenseTypesStore } from '@/stores/expenseTypes'
import { useCurrencyStore } from '@/stores/currency'
import dayjs from 'dayjs'

const entriesStore = useEntriesStore()
const typesStore = useExpenseTypesStore()
const currencyStore = useCurrencyStore()

// Month navigation — default to current month
const currentMonth = ref(dayjs().format('YYYY-MM'))
const isCurrentMonth = computed(() => currentMonth.value === dayjs().format('YYYY-MM'))
const monthLabel = computed(() => dayjs(currentMonth.value + '-01').format('MMMM YYYY'))

function prevMonth() { currentMonth.value = dayjs(currentMonth.value + '-01').subtract(1, 'month').format('YYYY-MM') }
function nextMonth() {
  if (!isCurrentMonth.value) currentMonth.value = dayjs(currentMonth.value + '-01').add(1, 'month').format('YYYY-MM')
}

const summary = computed(() => entriesStore.getMonthlySummary(currentMonth.value))

// Filters
const activeTypeFilter = ref('all')
const activeCategoryFilter = ref('')

const typeFilters = [
  { label: 'All', value: 'all' },
  { label: '💚 Income', value: 'income' },
  { label: '💸 Expenses', value: 'expense' },
  { label: '📅 Events', value: 'event' },
]

const filteredIncomes = computed(() => summary.value.incomes)

const filteredExpenses = computed(() => {
  if (!activeCategoryFilter.value) return summary.value.expenses
  return summary.value.expenses.filter(e => e.expenseTypeId == activeCategoryFilter.value)
})

const incomesTotal = computed(() => filteredIncomes.value.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0))
const expensesTotal = computed(() => filteredExpenses.value.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0))

// Category breakdown chart data
const categoryBreakdown = computed(() => {
  const exp = summary.value.expenses
  const total = exp.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const map = {}
  for (const e of exp) {
    const cat = typesStore.getById(e.expenseTypeId)
    const key = e.expenseTypeId || 'other'
    if (!map[key]) map[key] = { id: key, name: cat?.name || 'Other', icon: cat?.icon || '💸', color: (cat?.color || '#888') + 'cc', total: 0, count: 0 }
    map[key].total += parseFloat(e.amount) || 0
    map[key].count++
  }
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, pct: total > 0 ? (c.total / total) * 100 : 0 }))
})

function getCatIcon(id) { return typesStore.getById(id)?.icon || '💸' }
function getCatName(id) { return typesStore.getById(id)?.name || '' }
function getCatColor(id) { return (typesStore.getById(id)?.color || '#888') + '22' }
function formatDate(date, time) { return dayjs(`${date} ${time}`).format('MMM D, HH:mm') }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; gap: 1rem; }
.page-header h1 { margin-bottom: 0.2rem; }

.month-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.month-title { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
.month-title .display { font-size: 1.375rem; }

.balance-card { margin-bottom: 1.25rem; border-left: 4px solid var(--color-border); }
.balance-card.positive { border-left-color: var(--color-accent); }
.balance-card.negative { border-left-color: var(--color-expense); }
.balance-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
.balance-item { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; flex: 1; }
.balance-label { text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
.balance-val { font-weight: 700; font-size: 1rem; }
.balance-minus, .balance-equals { color: var(--color-text-muted); font-weight: 300; font-size: 1.25rem; flex-shrink: 0; }
.income-color { color: var(--color-accent); }
.income { color: var(--color-accent); }
.expense-color { color: var(--color-expense); }
.expense { color: var(--color-expense); }

.filters-bar { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
.filter-group { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
.filter-group-label { white-space: nowrap; }
.type-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-chip {
  padding: 0.3rem 0.75rem; border: 1px solid var(--color-border); border-radius: 999px;
  font-size: 0.8rem; font-weight: 500; color: var(--color-text-secondary);
  cursor: pointer; background: var(--color-surface); transition: all var(--transition);
}
.filter-chip:hover { border-color: var(--color-border-strong); color: var(--color-text); }
.filter-chip.active { background: var(--color-text); border-color: var(--color-text); color: var(--color-bg); }
.filter-select { max-width: 200px; padding: 0.375rem 2.5rem 0.375rem 0.75rem; font-size: 0.8125rem; }

.summary-sections { display: flex; flex-direction: column; gap: 0.625rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0; margin-bottom: 0.5rem; }
.section-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9375rem; }
.section-total { font-weight: 700; font-size: 1rem; }

/* Category breakdown bar chart */
.category-breakdown { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; }
.cat-row { display: flex; align-items: center; gap: 0.625rem; }
.cat-left { display: flex; align-items: center; gap: 0.375rem; width: 160px; flex-shrink: 0; }
.cat-icon { font-size: 1rem; }
.cat-bar-wrap { flex: 1; height: 8px; background: var(--color-surface-2); border-radius: 4px; overflow: hidden; }
.cat-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.cat-amount { width: 80px; text-align: right; flex-shrink: 0; }

.entry-group { display: flex; flex-direction: column; gap: 0.5rem; }
.summary-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.summary-row-left { display: flex; align-items: flex-start; gap: 0.625rem; flex: 1; min-width: 0; }
.sum-icon { width: 34px; height: 34px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; background: var(--color-surface-2); }
.income-icon { background: var(--color-accent-light); }
.event-icon { background: var(--color-surface-2); }
.sum-amount { font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
.no-data { padding: 1rem; text-align: center; }
.badge-income { background: var(--color-accent-light); color: var(--color-accent); }
</style>