<template>
    <div>
        <h3>Recurring Event Options</h3>
        <label for="recurrence">Recurrence:</label>
        <select v-model="recurrence" id="recurrence">
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
        </select>

        <div v-if="recurrence !== 'none'">
            <label for="start-date">Start Date:</label>
            <input type="date" v-model="startDate" id="start-date" />

            <label for="end-date">End Date:</label>
            <input type="date" v-model="endDate" id="end-date" />

            <label for="time">Time:</label>
            <input type="time" v-model="time" id="time" />
        </div>

        <button @click="saveOptions">Save Options</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const recurrence = ref('none');
const startDate = ref('');
const endDate = ref('');
const time = ref('');

const saveOptions = () => {
    // Logic to save the recurrence options
    console.log({
        recurrence: recurrence.value,
        startDate: startDate.value,
        endDate: endDate.value,
        time: time.value,
    });
};
</script>

<style scoped>
h3 {
    margin-bottom: 1rem;
}
label {
    display: block;
    margin: 0.5rem 0;
}
</style>