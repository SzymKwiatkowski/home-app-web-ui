import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const CURRENCIES = [
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', position: 'after' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', position: 'before' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', position: 'after' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', position: 'after' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', position: 'after' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', position: 'after' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', position: 'after' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
]

export const useCurrencyStore = defineStore('currency', () => {
  const defaultCode = ref(localStorage.getItem('et_currency') || 'PLN')

  const defaultCurrency = computed(() => CURRENCIES.find(c => c.code === defaultCode.value) || CURRENCIES[0])

  function setDefault(code) {
    defaultCode.value = code
    localStorage.setItem('et_currency', code)
  }

  function format(amount, currencyCode) {
    const code = currencyCode || defaultCode.value
    const cur = CURRENCIES.find(c => c.code === code) || defaultCurrency.value
    const formatted = parseFloat(amount).toFixed(2)
    return cur.position === 'before' ? `${cur.symbol}${formatted}` : `${formatted} ${cur.symbol}`
  }

  function getSymbol(code) {
    const cur = CURRENCIES.find(c => c.code === (code || defaultCode.value))
    return cur?.symbol || 'zł'
  }

  return { defaultCode, defaultCurrency, currencies: CURRENCIES, setDefault, format, getSymbol }
})