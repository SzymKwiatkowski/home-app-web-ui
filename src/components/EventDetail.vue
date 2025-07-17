<template>
  <v-card>
    <v-card-title>
      {{ event?.name || 'Event Details' }}
    </v-card-title>
    <v-card-text>
      <div v-if="event">
        <p><strong>Description:</strong> {{ event.description }}</p>
        <p><strong>Date:</strong> {{ event.start }}</p>
        <p v-if="event.payment"><strong>Payment:</strong> {{ event.payment }}</p>
      </div>
      <div v-else>
        <p>No event selected.</p>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="$emit('close')">Close</v-btn>
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
</script>

<style scoped>
/* Add any component-specific styles here */
</style>