<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit entry' : 'New entry' }}</h2>
          <button class="btn btn-ghost btn-icon" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <!-- Type selector -->
          <div class="type-selector">
            <button class="type-btn" :class="{ active: form.type === 'expense' }" @click="form.type = 'expense'">
              <span>💸</span> Expense
            </button>
            <button class="type-btn income" :class="{ active: form.type === 'income' }" @click="form.type = 'income'">
              <span>💚</span> Income
            </button>
            <button class="type-btn" :class="{ active: form.type === 'event' }" @click="form.type = 'event'">
              <span>📅</span> Event
            </button>
          </div>

          <div class="form-fields">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input v-model="form.name" class="form-input" type="text" placeholder="e.g. Salary, Groceries, Meeting..." />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input v-model="form.date" class="form-input" type="date" />
              </div>
              <div class="form-group">
                <label class="form-label">Time *</label>
                <input v-model="form.time" class="form-input" type="time" />
              </div>
            </div>

            <template v-if="form.type === 'expense' || form.type === 'income'">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Amount *</label>
                  <div class="amount-input">
                    <span class="currency-symbol">{{ currencyStore.getSymbol(form.currency) }}</span>
                    <input v-model.number="form.amount" class="form-input" type="number" min="0" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Currency</label>
                  <select v-model="form.currency" class="form-select">
                    <option v-for="c in currencyStore.currencies" :key="c.code" :value="c.code">
                      {{ c.code }} — {{ c.symbol }}
                    </option>
                  </select>
                </div>
              </div>

            </template>

            <!-- Category — shown for all entry types when categories exist -->
            <div class="form-group" v-if="typesStore.forEntryType(form.type).length">
              <label class="form-label">Category</label>
              <select v-model="form.categoryId" class="form-select">
                <option value="">No category</option>
                <option v-for="t in typesStore.forEntryType(form.type)" :key="t.id" :value="t.id">
                  {{ t.icon }} {{ t.name }}
                </option>
              </select>
            </div>

            <!-- Assigned users -->
            <div class="form-group">
              <label class="form-label">Assigned to</label>
              <UserPicker v-model="form.assignedUserIds" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-textarea" placeholder="Optional notes..." />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="handleSave">
            {{ isEdit ? 'Save changes' : 'Add entry' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { useEntryTypesStore } from '@/stores/entryTypes'
import { useCurrencyStore } from '@/stores/currency'
import UserPicker from '@/components/UserPicker.vue'
import dayjs from 'dayjs'

const props = defineProps({
  entry: { type: Object, default: null },
  defaultType: { type: String, default: 'expense' },
  defaultDate: { type: String, default: null },
})
const emit = defineEmits(['close', 'saved'])

const entriesStore = useEntriesStore()
const typesStore = useEntryTypesStore()
const currencyStore = useCurrencyStore()

const isEdit = computed(() => !!props.entry)

const form = reactive({
  type: props.entry?.type || props.defaultType,
  name: props.entry?.name || '',
  date: props.entry?.date || props.defaultDate || dayjs().format('YYYY-MM-DD'),
  time: props.entry?.time || dayjs().format('HH:mm'),
  amount: props.entry?.amount || '',
  currency: props.entry?.currency || currencyStore.defaultCode,
  categoryId: props.entry?.categoryId ?? props.entry?.expenseTypeId ?? '',
  assignedUserIds: props.entry?.assignedUserIds || (props.entry?.assignedUserId ? [props.entry.assignedUserId] : []),
  description: props.entry?.description || '',
})

function handleSave() {
  if (!form.name || !form.date || !form.time) return
  if ((form.type === 'expense' || form.type === 'income') && !form.amount) return
  const data = {
    type: form.type,
    name: form.name,
    date: form.date,
    time: form.time,
    amount: (form.type === 'expense' || form.type === 'income') ? parseFloat(form.amount) : null,
    currency: (form.type === 'expense' || form.type === 'income') ? form.currency : null,
    categoryId: form.categoryId || null,
    assignedUserIds: form.assignedUserIds,
    description: form.description,
  }

  if (isEdit.value) {
    entriesStore.updateEntry(props.entry.id, data)
  } else {
    entriesStore.addEntry(data)
  }
  emit('saved')
  emit('close')
}
</script>

<style scoped>
.type-selector { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
.type-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem 0.25rem; border: 2px solid var(--color-border);
  border-radius: var(--radius-md); font-size: 0.8125rem; font-weight: 500;
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition); background: var(--color-surface-2);
}
.type-btn:hover { border-color: var(--color-border-strong); }
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
</style>