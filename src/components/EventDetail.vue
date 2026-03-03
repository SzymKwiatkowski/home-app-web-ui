<template>
  <v-card>
    <v-card-title>
      <div class="flex items-center gap-2">
        <span>{{ event?.title || 'Event Details' }}</span>
        <v-chip 
          v-if="event?.type" 
          :color="getTypeColor(event.type)"
          text-color="white"
          size="small"
        >
          {{ event.type.toUpperCase() }}
        </v-chip>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="event">
        <p v-if="event.description" class="mb-2">
          <strong>Description:</strong> {{ event.description }}
        </p>
        <p class="mb-2">
          <strong>Start time:</strong> {{ formatDate(event.start) }}
        </p>
        <p class="mb-2">
          <strong>End time:</strong> {{ formatDate(event.end) }}
        </p>
        <p v-if="event.type === 'payment' && event.value" class="mb-2">
          <strong>Amount:</strong> {{ formatCurrency(event.value) }}
        </p>
        <p v-else-if="event.type === 'task' && event.value" class="mb-2">
          <strong>Task Details:</strong> {{ event.value }}
        </p>
      </div>
      <div v-else>
        <p>No event selected.</p>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="handleEdit">Edit</v-btn>
      <v-btn @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit'])

function handleEdit() {
  emit('edit', props.event)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d)) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatCurrency(value) {
  // Format as currency (you can adjust the currency symbol)
  return `$${Number.parseFloat(value).toFixed(2)}`
}

function getTypeColor(type) {
  return type === 'payment' ? 'green' : 'blue'
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>