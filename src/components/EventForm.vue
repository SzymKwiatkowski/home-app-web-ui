<template>
  <v-card>
    <v-card-title>Create Event</v-card-title>
    <v-card-text>
      <v-text-field v-model="title" label="Title" />
      <v-text-field v-model="description" label="Description" />

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ attrs }">
          <v-text-field
            :value="formattedDate"
            label="Date"
            v-bind="attrs"
          />
        </template>
        <v-date-picker v-model="date" @input="menu = false" />
      </v-menu>
      <v-text-field v-model="payment" label="Payment (optional)" type="number" />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" elevation="8" @click="save">Save</v-btn>
      <v-btn @click="$emit('close')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const props = defineProps({ date: [Date] })
const emit = defineEmits(['save', 'close'])

const title = ref('')
const description = ref('')
const date = ref(props.date)
const payment = ref('')
const menu = ref(false)

watch(() => props.date, (val) => {
  date.value = val
})

// Format date as dd.mm.yyyy hh:mm
const formattedDate = computed(() => {
  let d = date.value instanceof Date ? date.value : new Date(date.value)
  if (isNaN(d)) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

function save() {
  emit('save', {
    title: title.value,
    description: description.value,
    start: date.value,
    end: addMinutes(date.value, 30),
    payment: payment.value,
    color: 'blue'
  })
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>