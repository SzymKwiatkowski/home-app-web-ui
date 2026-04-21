import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const THEMES = [
  {
    id: 'default',
    name: 'Sage',
    description: 'Clean & natural',
    preview: ['#fafaf8', '#2d6a4f', '#1a1a18'],
    vars: {
      '--color-bg': '#fafaf8',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#f4f4f1',
      '--color-border': '#e8e8e4',
      '--color-border-strong': '#d0d0c8',
      '--color-text': '#1a1a18',
      '--color-text-secondary': '#6b6b65',
      '--color-text-muted': '#a0a09a',
      '--color-accent': '#2d6a4f',
      '--color-accent-light': '#e8f4ee',
      '--color-accent-dark': '#1b4332',
      '--color-danger': '#c1440e',
      '--color-danger-light': '#fdf0ea',
      '--color-expense': '#c1440e',
      '--color-event': '#2d6a4f',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      '--shadow-lg': '0 12px 32px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    description: 'Easy on the eyes',
    preview: ['#0f1117', '#6c8ebf', '#e8eaf0'],
    vars: {
      '--color-bg': '#0f1117',
      '--color-surface': '#1a1d27',
      '--color-surface-2': '#22263a',
      '--color-border': '#2e3347',
      '--color-border-strong': '#3d4460',
      '--color-text': '#e8eaf0',
      '--color-text-secondary': '#9ba3c0',
      '--color-text-muted': '#5c6480',
      '--color-accent': '#6c8ebf',
      '--color-accent-light': '#1e2a3d',
      '--color-accent-dark': '#4a6fa0',
      '--color-danger': '#e07070',
      '--color-danger-light': '#2a1a1a',
      '--color-expense': '#e07070',
      '--color-event': '#6c8ebf',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.5)',
      '--shadow-lg': '0 12px 32px rgba(0,0,0,0.6)',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm & soft',
    preview: ['#fff8f7', '#c2556a', '#2d1a1f'],
    vars: {
      '--color-bg': '#fff8f7',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#fdf0ee',
      '--color-border': '#f2dcd8',
      '--color-border-strong': '#e5c4be',
      '--color-text': '#2d1a1f',
      '--color-text-secondary': '#7a5258',
      '--color-text-muted': '#b89498',
      '--color-accent': '#c2556a',
      '--color-accent-light': '#fde8ec',
      '--color-accent-dark': '#962d42',
      '--color-danger': '#b03050',
      '--color-danger-light': '#fde8ec',
      '--color-expense': '#b03050',
      '--color-event': '#c2556a',
      '--shadow-sm': '0 1px 3px rgba(180,80,100,0.08)',
      '--shadow-md': '0 4px 12px rgba(180,80,100,0.1)',
      '--shadow-lg': '0 12px 32px rgba(180,80,100,0.12)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool & focused',
    preview: ['#f0f7ff', '#1a6eb5', '#0a1929'],
    vars: {
      '--color-bg': '#f0f7ff',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#e4f0fb',
      '--color-border': '#cce0f5',
      '--color-border-strong': '#a8c9ea',
      '--color-text': '#0a1929',
      '--color-text-secondary': '#3a5a78',
      '--color-text-muted': '#7aa0c0',
      '--color-accent': '#1a6eb5',
      '--color-accent-light': '#d6eaf8',
      '--color-accent-dark': '#0d4a80',
      '--color-danger': '#b03a2e',
      '--color-danger-light': '#fde8e6',
      '--color-expense': '#b03a2e',
      '--color-event': '#1a6eb5',
      '--shadow-sm': '0 1px 3px rgba(20,80,140,0.08)',
      '--shadow-md': '0 4px 12px rgba(20,80,140,0.1)',
      '--shadow-lg': '0 12px 32px rgba(20,80,140,0.12)',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    description: 'Warm & energetic',
    preview: ['#fffbf0', '#c47a1a', '#1f1400'],
    vars: {
      '--color-bg': '#fffbf0',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#fdf3d8',
      '--color-border': '#f5e4b0',
      '--color-border-strong': '#e8ce84',
      '--color-text': '#1f1400',
      '--color-text-secondary': '#6b4c0a',
      '--color-text-muted': '#b89440',
      '--color-accent': '#c47a1a',
      '--color-accent-light': '#fef3cd',
      '--color-accent-dark': '#8a5200',
      '--color-danger': '#a83228',
      '--color-danger-light': '#fde8e6',
      '--color-expense': '#a83228',
      '--color-event': '#c47a1a',
      '--shadow-sm': '0 1px 3px rgba(160,100,0,0.08)',
      '--shadow-md': '0 4px 12px rgba(160,100,0,0.1)',
      '--shadow-lg': '0 12px 32px rgba(160,100,0,0.12)',
    },
  },
  {
    id: 'slate-dark',
    name: 'Graphite',
    description: 'Dark & minimal',
    preview: ['#181a1b', '#8ab4a0', '#d4d8d6'],
    vars: {
      '--color-bg': '#181a1b',
      '--color-surface': '#232628',
      '--color-surface-2': '#2c3032',
      '--color-border': '#383d40',
      '--color-border-strong': '#4a5054',
      '--color-text': '#d4d8d6',
      '--color-text-secondary': '#92a09a',
      '--color-text-muted': '#5a6660',
      '--color-accent': '#8ab4a0',
      '--color-accent-light': '#1e2b26',
      '--color-accent-dark': '#6a9480',
      '--color-danger': '#d47a6a',
      '--color-danger-light': '#2a1e1a',
      '--color-expense': '#d47a6a',
      '--color-event': '#8ab4a0',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.5)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.6)',
      '--shadow-lg': '0 12px 32px rgba(0,0,0,0.7)',
    },
  },
]

export const useThemeStore = defineStore('theme', () => {
  const savedId = localStorage.getItem('et_theme') || 'default'
  const activeId = ref(savedId)

  function getTheme(id) {
    return THEMES.find(t => t.id === id) || THEMES[0]
  }

  function applyTheme(id) {
    const theme = getTheme(id)
    const root = document.documentElement
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value)
    }
    // Signal dark themes so CSS can react if needed
    const isDark = ['dark', 'slate-dark'].includes(id)
    root.setAttribute('data-theme', id)
    root.setAttribute('data-dark', isDark ? 'true' : 'false')
  }

  function setTheme(id) {
    activeId.value = id
    localStorage.setItem('et_theme', id)
    applyTheme(id)
  }

  // Apply on store init
  applyTheme(savedId)

  return { activeId, themes: THEMES, setTheme, getTheme }
})