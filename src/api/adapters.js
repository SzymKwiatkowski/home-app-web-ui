/**
 * API adapters — translate between API schema and internal UI model.
 *
 * API entryKind enum:  1 = expense, 2 = income, 3 = event
 * API entryEntityKindId = UI categoryId  (int32, references GetEntryEntityKind.id)
 * API occuredAtOnUtc (ISO datetime)      = UI date (YYYY-MM-DD) + time (HH:mm)
 * API userIds (string[])                 = UI assignedUserIds
 * API GetEntry has no `completed` field  → UI adds it as local-only optimistic state
 *   NOTE: the API has PUT /api/entries/{id}/toggle for completion toggling.
 *         The GET response does NOT return a completed field yet — see gaps note.
 */

import { api } from './client'
import dayjs from 'dayjs'
import { buildCron, parseCron } from './cron'

// ─── entryKind numeric enum ──────────────────────────────────────
export const EVENT_KIND = { expense: 1, income: 2, event: 3 }
export const EVENT_KIND_LABEL = { 1: 'expense', 2: 'income', 3: 'event' }

// ─── Entries ─────────────────────────────────────────────────────
function entryFromApi(e) {
  const dt = dayjs(e.occuredAtOnUtc)
  return {
    id: e.id,                                   // UUID string
    type: EVENT_KIND_LABEL[e.entryKind] || 'expense',
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
    entryKind: EVENT_KIND[e.type] ?? 0,
    name: e.name,
    amount: e.amount ?? null,
    userIds: (e.assignedUserIds ?? []).map(String),   // UUID strings
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
// API schema: { id: UUID, name: string, entryKind: int32 }
// UI model:   { id: UUID, name: string, entryType: 'expense'|'income'|'event', icon: string, color: string }
// NOTE: API does NOT store icon or color — those remain UI-only (localStorage).

function kindFromApi(k) {
  return {
    id: k.id,
    name: k.name,
    entryType: EVENT_KIND_LABEL[k.entryKind] || 'expense',
    // icon & color are client-side only — stored in localStorage alongside API id
    icon: k.icon,
    color: k.color,
  }
}

function kindToApi(k) {
  return {
    name: k.name,
    entryKind: EVENT_KIND[k.entryType] ?? 1,
    icon: k.icon,
    color: k.color
  }
}

export const entryKindsApi = {
  getAll: () => api.get('/api/entryentitykinds').then(list => list.map(kindFromApi)),
  create: (kind) => api.post('/api/entryentitykinds', kindToApi(kind)), // returns UUID
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
// NOTE: API has no entryKind, categoryId, or currency on periodic entries — see gaps.

function periodicFromApi(p) {
  const cronFields = parseCron(p.periodDefinition) || {}
  return {
    id: p.id,
    name: p.name,
    amount: p.amount ?? null,
    currency: null,           // ← GAP
    type: EVENT_KIND_LABEL[p.entryKind] || 'expense',          // ← GAP: no entryKind on periodic entries
    categoryId: p.entryEntityKindId,         // ← GAP: no entryEntityKindId on periodic entries
    // Decode cron back into UI fields
    recurrence: cronFields.recurrence || 'monthly',
    dayOfMonth: cronFields.dayOfMonth || 1,
    dayOfWeek:  cronFields.dayOfWeek  || 2,
    month:      cronFields.month      || 1,
    time:       cronFields.time       || '08:00',
    periodDefinition: p.periodDefinition,   // keep raw cron for display
    nextRun: p.occuredAtOnUtc ? dayjs(p.occuredAtOnUtc).format('YYYY-MM-DD') : null,
    active: p.isActive,
    assignedUserIds: p.userIds ?? [],
    description: '',          // ← GAP: no description on periodic entries
  }
}

function periodicToApi(p) {
  const cron = buildCron({
    recurrence: p.recurrence,
    time:       p.time       || '08:00',
    dayOfMonth: p.dayOfMonth || 1,
    dayOfWeek:  p.dayOfWeek  || 2,
    month:      p.month      || 1,
  })
  return {
    name: p.name,
    amount: p.amount ?? null,
    periodDefinition: cron,
    occuredAtOnUtc: p.nextRun ? dayjs(p.nextRun).toISOString() : null,
    isActive: p.active ?? true,
    userIds: (p.assignedUserIds ?? []).map(String),   // UUID strings
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
// GET /api/users returns GetUser[]: { id: UUID, userName: string, email: string }
// /api/users/manage/info returns: { email, isEmailConfirmed }

function userFromApi(u) {
  return {
    id: u.id,              // UUID string
    name: u.userName,      // API uses userName, UI uses name
    email: u.email,
  }
}

export const usersApi = {
  register:   (email, password) => api.post('/api/users/register', { email, password }),
  login:      (email, password) => api.post('/api/users/login?useCookies=false', { email, password }),
  refresh:    (refreshToken)    => api.post('/api/users/refresh', { refreshToken }),
  getAll:     ()                => api.get('/api/users').then(list => list.map(userFromApi)),
  getInfo:    ()                => api.get('/api/users/manage/info'),
  updateInfo: (data)            => api.post('/api/users/manage/info', data),
}
