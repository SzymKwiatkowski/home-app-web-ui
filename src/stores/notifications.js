import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'

export const useNotificationsStore = defineStore('notifications', () => {
  const dismissed = ref(new Set(JSON.parse(localStorage.getItem('et_dismissed_notifs') || '[]')))

  function saveDismissed() {
    localStorage.setItem('et_dismissed_notifs', JSON.stringify([...dismissed.value]))
  }

  function dismiss(id) { dismissed.value.add(id); saveDismissed() }
  function dismissAll(ids) { ids.forEach(id => dismissed.value.add(id)); saveDismissed() }
  function isDismissed(id) { return dismissed.value.has(id) }

  // Returns active (non-dismissed) notifications from a reactive entries array
  function getActiveNotifications(entries) {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => {
        if (e.completed) return false
        if (e.type === 'event') return false
        if (e.date > today) return false
        return !dismissed.value.has(`overdue-${e.id}`)
      })
      .map(e => ({
        id: `overdue-${e.id}`,
        entryId: e.id,
        type: e.type,
        name: e.name,
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        assignedUserId: e.assignedUserId,
        daysOverdue: dayjs().diff(dayjs(e.date), 'day'),
        severity: dayjs(e.date).isBefore(dayjs().subtract(3, 'day')) ? 'high' : 'medium',
        message: e.type === 'income'
          ? `Income not yet received: "${e.name}"`
          : `Unpaid expense: "${e.name}"`,
      }))
  }

  return { dismiss, dismissAll, isDismissed, getActiveNotifications }
})
