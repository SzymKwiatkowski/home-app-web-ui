/**
 * Bootstraps all remote data once the user is authenticated.
 * Called from App.vue on mount and after login.
 */
import { useEntriesStore } from '@/stores/entries'
import { useEntryTypesStore } from '@/stores/entryTypes'
import { useCurrencyStore } from '@/stores/currency'
import { useScheduledStore } from '@/stores/scheduled'
import dayjs from 'dayjs'

export async function bootstrapAppData() {
  const entriesStore   = useEntriesStore()
  const typesStore     = useEntryTypesStore()
  const currencyStore  = useCurrencyStore()
  const scheduledStore = useScheduledStore()

  // Fetch all in parallel — UI will show loading states per-store
  await Promise.allSettled([
    typesStore.fetchAll(),
    currencyStore.fetchAll(),
    scheduledStore.fetchAll(),
    // Fetch entries for the last 3 months by default
    entriesStore.fetchAll({
      startDate: dayjs().subtract(3, 'month').startOf('month').toISOString(),
      endDate:   dayjs().endOf('day').toISOString(),
    }),
  ])
}
