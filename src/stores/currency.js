import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currenciesApi } from '@/api/adapters'

// Position inference (API doesn't store this)
function inferPosition(code) {
  const afterCodes = ['PLN','CZK','SEK','NOK','DKK','HUF','ISK','HRK']
  return afterCodes.includes(code) ? 'after' : 'before'
}

export const useCurrencyStore = defineStore('currency', () => {
  const currencies = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  const defaultCode = ref(localStorage.getItem('et_currency') || 'PLN')

  const defaultCurrency = computed(() =>
    currencies.value.find(c => c.code === defaultCode.value) ||
    currencies.value[0] ||
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', position: 'after' }
  )

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const raw = await currenciesApi.getAll()
      // Ensure position is set (API returns id, name, symbol, code)
      currencies.value = raw.map(c => ({ ...c, position: inferPosition(c.code) }))
    } catch (e) {
      error.value = e.message
      // Fall back to built-in list so UI still works without API
      if (!currencies.value.length) {
        currencies.value = FALLBACK_CURRENCIES
      }
    } finally {
      loading.value = false
    }
  }

  async function createCurrency(data) {
    loading.value = true
    error.value = null
    try {
      await currenciesApi.create(data)
      await fetchAll()   // refresh list
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCurrency(id) {
    try {
      await currenciesApi.delete(id)
      currencies.value = currencies.value.filter(c => c.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  function setDefault(code) {
    defaultCode.value = code
    localStorage.setItem('et_currency', code)
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
    fetchAll, createCurrency, deleteCurrency, setDefault, format, getSymbol,
  }
})

// Fallback list used when API is unreachable
const FALLBACK_CURRENCIES = [
  { id: null, code: 'PLN', symbol: 'zł', name: 'Polish Złoty',    position: 'after'  },
  { id: null, code: 'USD', symbol: '$',  name: 'US Dollar',        position: 'before' },
  { id: null, code: 'EUR', symbol: '€',  name: 'Euro',             position: 'before' },
  { id: null, code: 'GBP', symbol: '£',  name: 'British Pound',    position: 'before' },
  { id: null, code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',      position: 'before' },
  { id: null, code: 'CZK', symbol: 'Kč', name: 'Czech Koruna',     position: 'after'  },
  { id: null, code: 'SEK', symbol: 'kr', name: 'Swedish Krona',    position: 'after'  },
  { id: null, code: 'NOK', symbol: 'kr', name: 'Norwegian Krone',  position: 'after'  },
  { id: null, code: 'JPY', symbol: '¥',  name: 'Japanese Yen',     position: 'before' },
  { id: null, code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',  position: 'before' },
]
