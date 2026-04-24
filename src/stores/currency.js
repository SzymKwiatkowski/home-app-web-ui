import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currenciesApi } from '@/api/adapters'

function inferPosition(code) {
  const afterCodes = ['PLN','CZK','SEK','NOK','DKK','HUF','ISK','HRK']
  return afterCodes.includes(code) ? 'after' : 'before'
}

export const useCurrencyStore = defineStore('currency', () => {
  const currencies = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  // defaultCode is now server-driven via isDefault on GetCurrency.
  // localStorage is kept as a fallback for offline/pre-fetch use.
  const defaultCode = ref(localStorage.getItem('et_currency') || 'PLN')

  const defaultCurrency = computed(() =>
    currencies.value.find(c => c.isDefault) ||
    currencies.value.find(c => c.code === defaultCode.value) ||
    currencies.value[0] ||
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', position: 'after', isDefault: true }
  )

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const raw = await currenciesApi.getAll()
      currencies.value = raw.map(c => ({ ...c, position: inferPosition(c.code) }))
      // Sync defaultCode from server's isDefault flag
      const serverDefault = currencies.value.find(c => c.isDefault)
      if (serverDefault) {
        defaultCode.value = serverDefault.code
        localStorage.setItem('et_currency', serverDefault.code)
      }
    } catch (e) {
      error.value = e.message
      if (!currencies.value.length) currencies.value = FALLBACK_CURRENCIES
    } finally {
      loading.value = false
    }
  }

  async function createCurrency(data) {
    loading.value = true
    error.value = null
    try {
      await currenciesApi.create(data)
      await fetchAll()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // PUT /api/currencies/{id} — marks a currency as default server-side
  // Returns updated Currencies list; we re-sync isDefault flags from response
  async function setDefault(id) {
    const cur = currencies.value.find(c => c.id === id)
    if (!cur) return
    // Optimistic update
    currencies.value = currencies.value.map(c => ({ ...c, isDefault: c.id === id }))
    defaultCode.value = cur.code
    localStorage.setItem('et_currency', cur.code)
    try {
      await currenciesApi.setAsDefault(id)
      // Refresh to get authoritative isDefault state
      await fetchAll()
    } catch (e) {
      error.value = e.message
      // Revert on failure
      await fetchAll()
    }
  }

  async function deleteCurrency(intId, uuid) {
    try {
      await currenciesApi.delete(intId, uuid)
      currencies.value = currencies.value.filter(c => c.id !== intId)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  function format(amount, currencyCode) {
    const code = currencyCode || defaultCode.value
    const cur = currencies.value.find(c => c.code === code) || defaultCurrency.value
    const formatted = parseFloat(amount || 0).toFixed(2)
    return cur.position === 'before'
      ? `${cur.symbol}${formatted}`
      : `${formatted} ${cur.symbol}`
  }

  function getSymbol(code) {
    const cur = currencies.value.find(c => c.code === (code || defaultCode.value))
    return cur?.symbol || 'zł'
  }

  return {
    currencies, loading, error, defaultCode, defaultCurrency,
    fetchAll, createCurrency, setDefault, deleteCurrency, format, getSymbol,
  }
})

const FALLBACK_CURRENCIES = [
  { id: null, code: 'PLN', symbol: 'zł', name: 'Polish Złoty',   position: 'after',  isDefault: true  },
  { id: null, code: 'USD', symbol: '$',  name: 'US Dollar',       position: 'before', isDefault: false },
  { id: null, code: 'EUR', symbol: '€',  name: 'Euro',            position: 'before', isDefault: false },
  { id: null, code: 'GBP', symbol: '£',  name: 'British Pound',   position: 'before', isDefault: false },
  { id: null, code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',     position: 'before', isDefault: false },
  { id: null, code: 'CZK', symbol: 'Kč', name: 'Czech Koruna',    position: 'after',  isDefault: false },
  { id: null, code: 'SEK', symbol: 'kr', name: 'Swedish Krona',   position: 'after',  isDefault: false },
  { id: null, code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', position: 'after',  isDefault: false },
  { id: null, code: 'JPY', symbol: '¥',  name: 'Japanese Yen',    position: 'before', isDefault: false },
  { id: null, code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before', isDefault: false },
]
