/**
 * API adapters — translate between API schema and internal UI model.
 *
 * API eventKind enum:  0 = expense, 1 = income, 2 = event
 * API entryEntityKindId = UI categoryId  (int32, references GetEntryEntityKind.id)
 * API occuredAtOnUtc (ISO datetime)      = UI date (YYYY-MM-DD) + time (HH:mm)
 * API userIds (string[])                 = UI assignedUserIds
 * API GetEntry has no `completed` field  → UI adds it as local-only optimistic state
 *   NOTE: the API has PUT /api/entries/{id}/toggle for completion toggling.
 *         The GET response does NOT return a completed field yet — see gaps note.
 */

import { api } from './client'
import dayjs from 'dayjs'

// ─── eventKind numeric enum ──────────────────────────────────────
export const EVENT_KIND = { expense: 0, income: 1, event: 2 }
export const EVENT_KIND_LABEL = { 0: 'expense', 1: 'income', 2: 'event' }

// ─── Entries ─────────────────────────────────────────────────────
function entryFromApi(e) {
  const dt = dayjs(e.occuredAtOnUtc)
  return {
    id: e.id,                                   // UUID string
    type: EVENT_KIND_LABEL[e.eventKind] || 'expense',
    name: e.name,
    amount: e.amount ?? null,
    currency: null,                             // ← GAP: API has no currency per entry
    categoryId: e.entryEntityKindId ?? null,
    date: dt.format('YYYY-MM-DD'),
    time: dt.format('HH:mm'),
    description: e.description ?? '',
    assignedUserIds: e.userIds ?? [],
    completed: false,                           // ← GAP: API toggle exists but GET doesn't return state
    completedAt: null,
    createdAt: dt.valueOf(),
  }
}

function entryToApi(e) {
  const dateTime = dayjs(`${e.date} ${e.time}`).toISOString()
  return {
    eventKind: EVENT_KIND[e.type] ?? 0,
    name: e.name,
    amount: e.amount ?? null,
    userIds: e.assignedUserIds ?? [],
    occuredAtOnUtc: dateTime,
    description: e.description ?? null,
    entryEntityKindId: e.categoryId ?? null,
  }
}

export const entriesApi = {
  getAll: (params) => api.get('/api/entries', params).then(list => list.map(entryFromApi)),
  create: (entry)  => api.post('/api/entries', entryToApi(entry)),   // returns UUID
  toggle: (id)     => api.put(`/api/entries/${id}/toggle`).then(entryFromApi),
}

// ─── Entry Entity Kinds (categories) ─────────────────────────────
// API schema: { id: int32, name: string, entryKind: int32 }
// UI model:   { id: int32, name: string, entryType: 'expense'|'income'|'event', icon: string, color: string }
// NOTE: API does NOT store icon or color — those remain UI-only (localStorage).

function kindFromApi(k) {
  return {
    id: k.id,
    name: k.name,
    entryType: EVENT_KIND_LABEL[k.entryKind] || 'expense',
    // icon & color are client-side only — stored in localStorage alongside API id
    icon: null,
    color: null,
  }
}

function kindToApi(k) {
  return {
    name: k.name,
    entryKind: EVENT_KIND[k.entryType] ?? 0,
  }
}

export const entryKindsApi = {
  getAll: () => api.get('/api/entryentitykinds').then(list => list.map(kindFromApi)),
  create: (kind) => api.post('/api/entryentitykinds', kindToApi(kind)), // returns int32 id
}

// ─── Currencies ───────────────────────────────────────────────────
// API schema: { id: UUID, name, symbol, code }
function currencyFromApi(c) {
  return {
    id: c.id,   // UUID
    code: c.code,
    symbol: c.symbol,
    name: c.name,
    position: inferCurrencyPosition(c.code),
  }
}

function inferCurrencyPosition(code) {
  // Currencies where symbol goes after the amount
  const afterCodes = ['PLN','CZK','SEK','NOK','DKK','HUF','ISK','HRK']
  return afterCodes.includes(code) ? 'after' : 'before'
}

export const currenciesApi = {
  getAll: () => api.get('/api/currencies').then(list => list.map(currencyFromApi)),
  create: (c) => api.post('/api/currencies', { name: c.name, symbol: c.symbol, code: c.code }),
  delete: (id) => api.delete(`/api/currencies/${id}`, { id }),
}

// ─── Periodic Entries (Scheduled) ────────────────────────────────
// API schema: { id, occuredAtOnUtc, periodDefinition, name, amount, isActive, userIds }
// NOTE: API has no eventKind, categoryId, or currency on periodic entries — see gaps.

function periodicFromApi(p) {
  return {
    id: p.id,
    name: p.name,
    amount: p.amount ?? null,
    currency: null,           // ← GAP
    type: 'expense',          // ← GAP: no eventKind on periodic entries
    categoryId: null,         // ← GAP: no entryEntityKindId on periodic entries
    recurrence: p.periodDefinition,
    nextRun: p.occuredAtOnUtc ? dayjs(p.occuredAtOnUtc).format('YYYY-MM-DD') : null,
    active: p.isActive,
    assignedUserIds: p.userIds ?? [],
    description: '',          // ← GAP: no description on periodic entries
  }
}

function periodicToApi(p) {
  return {
    name: p.name,
    amount: p.amount ?? null,
    periodDefinition: p.recurrence,
    occuredAtOnUtc: p.nextRun ? dayjs(p.nextRun).toISOString() : null,
    isActive: p.active ?? true,
    userIds: p.assignedUserIds ?? [],
  }
}

export const periodicEntriesApi = {
  getAll: () => api.get('/api/periodicentries').then(list => list.map(periodicFromApi)),
  create: (p) => api.post('/api/periodicentries', periodicToApi(p)),  // returns UUID
}

// ─── Summaries ────────────────────────────────────────────────────
// API schema: { id, name, description, startTime, endTime, overallAmount }
// NOTE: summary is generated server-side from a date range; no per-type breakdown returned.
// The UI's detailed breakdown (expenses/incomes/events lists) continues to be derived
// client-side from the entries fetched for that month.

function summaryFromApi(s) {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    startTime: s.startTime,
    endTime: s.endTime,
    overallAmount: s.overallAmount ?? 0,
  }
}

export const summariesApi = {
  getAll: (params) => api.get('/api/summaries', params).then(list => list.map(summaryFromApi)),
  create: (startTime, endTime) => api.post('/api/summaries', { startTime, endTime }).then(summaryFromApi),
}

// ─── Users / Auth ─────────────────────────────────────────────────
// Login returns AccessTokenResponse: { accessToken, expiresIn, refreshToken, tokenType }
// /api/users/manage/info returns: { email, isEmailConfirmed }
// NOTE: No GET /api/users endpoint — user list is client-side only (usersStore).

export const usersApi = {
  register: (email, password) => api.post('/api/users/register', { email, password }),
  login:    (email, password) => api.post('/api/users/login?useCookies=false', { email, password }),
  refresh:  (refreshToken)    => api.post('/api/users/refresh', { refreshToken }),
  getInfo:  ()                => api.get('/api/users/manage/info'),
  updateInfo: (data)          => api.post('/api/users/manage/info', data),
}