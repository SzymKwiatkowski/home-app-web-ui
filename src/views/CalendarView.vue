<template>
  <div class="container mx-auto p-4">
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Calendar</h1>
      <button 
        @click="() => { selectedDate = new Date(); eventFormDialog = true }"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + New Event
      </button>
    </div>
    <v-sheet height="600">
      <vue-cal
        ref="vuecalRef"
        :selectedDate="selectedDate"
        dark
        time
        :events="events"
        :view="selectedCalendarType"
        :views="calendarTypes"
        editable-events
        @event-create="openEventForm"
        @event-click="handleEventClick"
        @event-update="handleEventUpdate"
      />
    </v-sheet>

    <!-- Event Create/Edit Modal -->
    <div v-if="eventFormDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <EventForm 
          :date="selectedDate" 
          :event="selectedEvent" 
          @save="handleEventSave" 
          @close="closeEventForm"
          @delete="handleEventDelete"
        />
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div v-else-if="eventDetailDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
        <EventDetail 
          :event="selectedEvent" 
          @close="eventDetailDialog = false"
          @edit="editEvent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EventForm from '@/components/EventForm.vue'
import EventDetail from '@/components/EventDetail.vue'
import { VueCal } from 'vue-cal'
import 'vue-cal/style'

const calendar = ref()
const value = ref('')
const today = ref(new Date())
const events = ref([])
const mode = ref('stack')
const colors = ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1']
const names = ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party']
const eventFormDialog = ref(false)
const eventDetailDialog = ref(false)
const selectedDate = ref(null)
const selectedEvent = ref(null)
const selectedCalendarType = ref("month")
const calendarTypes = ['month', 'week', 'day']
const weekday = ref([1, 2, 3, 4, 5, 6, 0]);
const weekdays = [
  { title: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
  { title: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
  { title: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
  { title: 'Mon, Wed, Fri', value: [1, 3, 5] }];

// Open event form for creating a new event
function openEventForm(cell) {
  selectedEvent.value = null
  if (cell?.date) {
    selectedDate.value = cell.date
  } else {
    selectedDate.value = new Date()
  }
  eventFormDialog.value = true
}

// Handle event click to view details
function handleEventClick(event) {
  selectedEvent.value = event.event
  eventDetailDialog.value = true
}

// Edit event from detail view
function editEvent(event) {
  selectedEvent.value = event
  eventDetailDialog.value = false
  eventFormDialog.value = true
}

// Close event form and reset
function closeEventForm() {
  eventFormDialog.value = false
  selectedEvent.value = null
  selectedDate.value = null
}

// Handle saving event (create or update)
function handleEventSave(eventData) {
  if (!eventData.id) {
    return
  }
  
  const existingIndex = events.value.findIndex(e => e.id === eventData.id)
  
  if (existingIndex >= 0) {
    // Update existing event
    events.value[existingIndex] = {
      ...eventData,
      allDay: false
    }
    console.log('Event updated:', eventData)
  } else {
    // Create new event
    events.value.push({
      ...eventData,
      allDay: false
    })
    console.log('Event created:', eventData)
  }
  
  closeEventForm()
}

// Handle event deletion
function handleEventDelete(eventId) {
  const index = events.value.findIndex(e => e.id === eventId)
  console.log('Deleting event with ID:', eventId, 'Found at index:', index)
  if (index >= 0) {
    const deletedEvent = events.value[index]
    events.value.splice(index, 1)
    console.log('Event deleted:', deletedEvent)
  }
  closeEventForm()
}

// Handle event dragging/updating from calendar
function handleEventUpdate(event) {
  const index = events.value.findIndex(e => e.id === event.id)
  if (index >= 0) {
    events.value[index] = {
      ...events.value[index],
      start: event.start,
      end: event.end
    }
    console.log('Event updated from calendar:', event)
  }
}

onMounted(() => {
  // Initialize with empty events array - user can add events manually

})
</script>