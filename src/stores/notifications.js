import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import dayjs from 'dayjs'

export const useNotificationsStore = defineStore('notifications', () => {
  // Notifications are purely derived — no dismissed state.
  // A notification is active as long as its entry is: not completed AND past due date.
  // "Past due" = entry date is today or earlier.

  const entriesStore = useEntriesStore()

  const notifications = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entriesStore.entries
      .filter(e => {
        if (e.type === 'event') return false   // events don't have financial state
        if (e.completed) return false           // completed = notification gone
        if (e.date > today) return false        // future entries are not overdue yet
        return true
      })
      .map(e => {
        const daysOverdue = dayjs().diff(dayjs(e.date), 'day')
        return {
          id: `notif-${e.id}`,
          entryId: e.id,
          type: e.type,           // 'expense' | 'income'
          name: e.name,
          date: e.date,
          time: e.time,
          amount: e.amount,
          currency: e.currency,
          assignedUserIds: e.assignedUserIds || [],
          completed: e.completed,
          daysOverdue,
          // severity: high = more than 3 days overdue
          severity: daysOverdue > 3 ? 'high' : 'medium',
          message: e.type === 'income'
            ? `Income not received: "${e.name}"`
            : `Unpaid expense: "${e.name}"`,
        }
      })
      // Most overdue first
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  })

  const count = computed(() => notifications.value.length)

  return { notifications, count }
})