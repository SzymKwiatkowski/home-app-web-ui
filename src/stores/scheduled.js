import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'

// Recurrence options
export const RECURRENCE_OPTIONS = [
  { value: 'daily',     label: 'Every day' },
  { value: 'weekly',    label: 'Every week' },
  { value: 'biweekly',  label: 'Every 2 weeks' },
  { value: 'monthly',   label: 'Every month' },
  { value: 'quarterly', label: 'Every quarter' },
  { value: 'yearly',    label: 'Every year' },
]

const SAMPLE_SCHEDULED = [
  {
    id: 1,
    type: 'income',
    name: 'Monthly salary',
    amount: 8500.00,
    currency: 'PLN',
    categoryId: null,
    recurrence: 'monthly',
    dayOfMonth: 1,
    time: '08:00',
    description: 'Net salary auto-added on 1st of month',
    assignedUserId: 1,
    active: true,
    nextRun: dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
    createdAt: Date.now() - 5000000,
  },
  {
    id: 2,
    type: 'expense',
    name: 'Netflix subscription',
    amount: 65.00,
    currency: 'PLN',
    categoryId: 5,
    recurrence: 'monthly',
    dayOfMonth: 15,
    time: '00:00',
    description: 'Auto-charged monthly',
    assignedUserId: 1,
    active: true,
    nextRun: dayjs().date() < 15
      ? dayjs().date(15).format('YYYY-MM-DD')
      : dayjs().add(1, 'month').date(15).format('YYYY-MM-DD'),
    createdAt: Date.now() - 3000000,
  },
  {
    id: 3,
    type: 'expense',
    name: 'Gym membership',
    amount: 120.00,
    currency: 'PLN',
    categoryId: 4,
    recurrence: 'monthly',
    dayOfMonth: 1,
    time: '07:00',
    description: '',
    assignedUserId: 1,
    active: false,
    nextRun: null,
    createdAt: Date.now() - 1000000,
  },
]

export const useScheduledStore = defineStore('scheduled', () => {
  const items = ref(JSON.parse(localStorage.getItem('et_scheduled') || JSON.stringify(SAMPLE_SCHEDULED)))

  function save() { localStorage.setItem('et_scheduled', JSON.stringify(items.value)) }

  function add(item) {
    const id = Date.now()
    items.value.push({ ...item, id, createdAt: Date.now() })
    save(); return id
  }

  function update(id, data) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx !== -1) { items.value[idx] = { ...items.value[idx], ...data }; save() }
  }

  function remove(id) { items.value = items.value.filter(s => s.id !== id); save() }

  function toggle(id) {
    const item = items.value.find(s => s.id === id)
    if (item) { item.active = !item.active; save() }
  }

  return { items, add, update, remove, toggle }
})