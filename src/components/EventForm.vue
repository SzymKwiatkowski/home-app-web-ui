<template>
  <v-card>
    <v-card-title>{{ isEditing ? 'Edit Event' : 'Create Event' }}</v-card-title>
    <v-card-text>
      <v-text-field v-model="formData.title" label="Event Title" class="mb-4" />
      <v-text-field v-model="formData.description" label="Description" class="mb-4" />

      <div class="mb-4">
        <v-select
          v-model="formData.type"
          :items="eventTypes"
          item-title="title"
          item-value="value"
          label="Select event type"
          outlined
          dense
        />
      </div>

      <!-- Start Date/Time Selection -->
      <div class="mb-4">
        <div class="grid grid-cols-2 gap-3">
          <v-menu
            v-model="startDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :value="formatStartDate"
                label="Start Date"
                readonly
                outlined
                dense
              />
            </template>
            <v-date-picker v-model="formData.startDate" @update:model-value="startDateMenu = false" />
          </v-menu>

          <v-menu
            v-model="startTimeMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :value="formatStartTime"
                label="Start Time"
                readonly
                outlined
                dense
              />
            </template>
            <v-time-picker v-model="formData.startTime" @update:model-value="startTimeMenu = false" format="24hr" />
          </v-menu>
        </div>
      </div>

      <!-- End Date/Time Selection -->
      <div class="mb-4">
        <div class="grid grid-cols-2 gap-3">
          <v-menu
            v-model="endDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :value="formatEndDate"
                label="End Date"
                readonly
                outlined
                dense
              />
            </template>
            <v-date-picker v-model="formData.endDate" @update:model-value="endDateMenu = false" />
          </v-menu>

          <v-menu
            v-model="endTimeMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :value="formatEndTime"
                label="End Time"
                readonly
                outlined
                dense
              />
            </template>
            <v-time-picker v-model="formData.endTime" @update:model-value="endTimeMenu = false" format="24hr" />
          </v-menu>
        </div>
      </div>

      <!-- Type-specific Value Field -->
      <v-text-field
        v-if="formData.type === 'payment'"
        v-model.number="formData.value"
        label="Amount"
        type="number"
        step="0.01"
        class="mb-4"
      />
      <v-text-field
        v-else-if="formData.type === 'task'"
        v-model="formData.value"
        label="Task Details (optional)"
        type="text"
        class="mb-4"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" elevation="8" @click="save">{{ isEditing ? 'Update Event' : 'Save Event' }}</v-btn>
      <v-btn @click="$emit('close')">Cancel</v-btn>
      <v-spacer />
      <v-btn v-if="isEditing" color="error" @click="deleteEvent">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  date: [Date],
  event: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close', 'delete'])

const isEditing = computed(() => {
  console.log('Checking if editing:', props.event)
  return !!props.event?.id})

const formData = ref({
  title: '',
  description: '',
  type: 'task',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '10:00',
  value: null
})

const eventTypes = [
  { title: 'Task', value: 'task' },
  { title: 'Payment', value: 'payment' }
]

const startDateMenu = ref(false)
const startTimeMenu = ref(false)
const endDateMenu = ref(false)
const endTimeMenu = ref(false)

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      formData.value = {
        title: newEvent.title || '',
        description: newEvent.description || '',
        type: newEvent.type || 'task',
        startDate: formatDateOnly(newEvent.start),
        startTime: formatTimeOnly(newEvent.start),
        endDate: formatDateOnly(newEvent.end),
        endTime: formatTimeOnly(newEvent.end),
        value: newEvent.value || null
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.date,
  (newDate) => {
    if (newDate && !props.event) {
      formData.value.startDate = formatDateOnly(newDate)
      formData.value.startTime = '09:00'
      formData.value.endDate = formatDateOnly(newDate)
      formData.value.endTime = '10:00'
    }
  },
  { immediate: true }
)

const formatStartDate = computed(() => {
  if (!formData.value.startDate) return ''
  const date = new Date(formData.value.startDate)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
})

const formatStartTime = computed(() => {
  return formData.value.startTime || '--:--'
})

const formatEndDate = computed(() => {
  if (!formData.value.endDate) return ''
  const date = new Date(formData.value.endDate)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
})

const formatEndTime = computed(() => {
  return formData.value.endTime || '--:--'
})

function formatDateOnly(date) {
  if (!date) return new Date().toISOString().split('T')[0]
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function formatTimeOnly(date) {
  if (!date) return '09:00'
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null

  if (dateStr instanceof Date){
    dateStr = formatDateOnly(dateStr);
  }

  if (timeStr instanceof Date){
    timeStr = formatTimeOnly(timeStr);
  }

  const [year, month, day] = dateStr.split('-')
  const [hours, minutes] = timeStr.split(':')
  return new Date(year, month - 1, day, hours, minutes)
}

function save() {
  if (!formData.value.title.trim()) {
    alert('Please enter an event title')
    return
  }
  if (!formData.value.startDate || !formData.value.startTime) {
    alert('Please select a start date and time')
    return
  }
  if (!formData.value.endDate || !formData.value.endTime) {
    alert('Please select an end date and time')
    return
  }

  const startDateTime = combineDateAndTime(formData.value.startDate, formData.value.startTime)
  const endDateTime = combineDateAndTime(formData.value.endDate, formData.value.endTime)

  if (endDateTime <= startDateTime) {
    alert('End time must be after start time')
    return
  }

  const eventData = {
    id: isEditing.value ? props.event.id : generateId(),
    title: formData.value.title,
    description: formData.value.description,
    start: startDateTime,
    end: endDateTime,
    type: formData.value.type,
    color: getColorForType(formData.value.type)
  }

  if (formData.value.value !== null && formData.value.value !== '') {
    eventData.value =
      formData.value.type === 'payment' ? Number.parseFloat(formData.value.value) : formData.value.value
  }

  emit('save', eventData)
}

function deleteEvent() {
  if (confirm('Are you sure you want to delete this event?')) {
    console.log('Deleting event with ID:', props.event.id);
    emit('delete', props.event?.id)
  }
}

function generateId() {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getColorForType(type) {
  return type === 'payment' ? 'green' : 'blue'
}
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>