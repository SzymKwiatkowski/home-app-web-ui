<template>
    <div>
        <h1>Event Details</h1>
        <div v-if="event">
            <h2>{{ event.title }}</h2>
            <p><strong>Date:</strong> {{ event.date }}</p>
            <p><strong>Description:</strong> {{ event.description }}</p>
            <p><strong>Location:</strong> {{ event.location }}</p>
            <p><strong>Payment Status:</strong> {{ event.paymentStatus }}</p>
            <button @click="editEvent">Edit Event</button>
            <button @click="deleteEvent">Delete Event</button>
        </div>
        <div v-else>
            <p>Loading event details...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const store = useStore();
const event = ref(null);

onMounted(() => {
    const eventId = route.params.id;
    event.value = store.getters.getEventById(eventId);
});

const editEvent = () => {
    // Logic to navigate to the edit event form
};

const deleteEvent = () => {
    const eventId = route.params.id;
    store.dispatch('deleteEvent', eventId);
};
</script>

<style scoped>
h1 {
    font-size: 2em;
    margin-bottom: 0.5em;
}
</style>