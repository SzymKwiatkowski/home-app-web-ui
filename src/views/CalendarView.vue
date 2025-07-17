<template>
  <div class="container mx-auto p-4">
    <v-toolbar color="primary">
        <v-select v-model="selectedCalendarType" :items="calendarTypes" class="ma-2 my-2" density="compact" label="View Mode"
          variant="outlined" hide-details></v-select>
        <v-select v-model="weekday" :items="weekdays" class="ma-2 my-2" density="compact" label="Weekdays" variant="outlined"
          hide-details></v-select>
    </v-toolbar>
    <v-sheet>
      <v-calendar ref="calendar" :view-mode="selectedCalendarType" color="primary" :events="events"
        @click:date="openEventForm" @click:event="showEvent"
        class="calendar" :time="false" :weekdays="weekday"></v-calendar>
    </v-sheet>

    <!-- Event Create Modal -->
    <div v-if="eventFormDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-50">
      <div class="bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <EventForm :date="selectedDate" @save="addEvent" @close="eventFormDialog = false" />
        <button @click="eventFormDialog = false"
          class="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-300">Close</button>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div v-if="eventDetailDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <EventDetail :event="selectedEvent" @close="eventDetailDialog = false" />
        <button @click="eventDetailDialog = false"
          class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EventForm from '@/components/EventForm.vue'
import EventDetail from '@/components/EventDetail.vue'
import { useDate } from 'vuetify'

const calendar = ref()
const today = ref(new Date())
const events = ref([])
const colors = ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1']
const names = ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party']
const eventFormDialog = ref(false)
const eventDetailDialog = ref(false)
const selectedDate = ref(null)
const selectedEvent = ref(null)
const selectedCalendarType = ref("month")
const calendarTypes = ['month', 'week']
const weekday = ref([1, 2, 3, 4, 5, 6, 0]);
const weekdays = [
  { title: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
  { title: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
  { title: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
  { title: 'Mon, Wed, Fri', value: [1, 3, 5] }];

// Fix: Accept and use the date from cell click
function openEventForm(cell) {
  // cell.date should be defined
  selectedDate.value = cell?.date || cell
  eventFormDialog.value = true
}

function addEvent(event) {
  events.value.push(event)
  eventFormDialog.value = false
}

function showEvent(event) {
  selectedEvent.value = event
  eventDetailDialog.value = true
}

onMounted(() => {
  const adapter = useDate()
  fetchEvents({ 
    start: adapter.startOfDay(adapter.startOfMonth(new Date())),
    end: adapter.endOfDay(adapter.endOfMonth(new Date())) })
})

function fetchEvents({ start, end }) {
  const _events = []
  const min = start
  const max = end
  const days = (max.getTime() - min.getTime()) / 86400000
  const eventCount = rnd(days, days + 20)
  for (let i = 0; i < eventCount; i++) {
    const allDay = rnd(0, 3) === 0
    const firstTimestamp = rnd(min.getTime(), max.getTime())
    const first = new Date(firstTimestamp - (firstTimestamp % 900000))
    const secondTimestamp = rnd(2, allDay ? 288 : 8) * 900000
    const second = new Date(first.getTime() + secondTimestamp)
    _events.push({
      title: names[rnd(0, names.length - 1)],
      start: first,
      end: second,
      color: colors[rnd(0, colors.length - 1)],
      allDay: !allDay,
    })
  }
  events.value = _events
}
function rnd(a, b) {
  return Math.floor((b - a + 1) * Math.random()) + a
}
</script>