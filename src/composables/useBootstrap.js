/**
 * Bootstraps all remote data once the user is authenticated.
 * Called from App.vue on mount and after login.
 */
import { useEntriesStore } from '@/stores/entries'
import { useEntryTypesStore } from '@/stores/entryTypes'
import { useCurrencyStore } from '@/stores/currency'
import { useScheduledStore } from '@/stores/scheduled'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

export async function bootstrapAppData() {
  const entriesStore   = useEntriesStore()
  const typesStore     = useEntryTypesStore()
  const currencyStore  = useCurrencyStore()
  const scheduledStore = useScheduledStore()
  const usersStore     = useUsersStore()
  const authStore      = useAuthStore()

  // Fetch all in parallel — UI will show loading states per-store
  const selfId = authStore.user?.id || null
  await Promise.allSettled([
    typesStore.fetchAll(),
    usersStore.fetchAll(selfId),
    currencyStore.fetchAll(),
    scheduledStore.fetchAll(),
    // Fetch entries for the last 3 months by default
    entriesStore.fetchAll({
      startDate: dayjs().subtract(3, 'month').startOf('month').toISOString(),
      endDate:   dayjs().endOf('day').toISOString(),
    }),
  ])
}
