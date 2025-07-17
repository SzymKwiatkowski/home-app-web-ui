import { createStore } from 'vuex';

const store = createStore({
    state: {
        events: [],
        payments: []
    },
    mutations: {
        addEvent(state, event) {
            state.events.push(event);
        },
        addPayment(state, payment) {
            state.payments.push(payment);
        },
        updateEvent(state, { id, updatedEvent }) {
            const index = state.events.findIndex(event => event.id === id);
            if (index !== -1) {
                state.events.splice(index, 1, updatedEvent);
            }
        },
        deleteEvent(state, id) {
            state.events = state.events.filter(event => event.id !== id);
        }
    },
    actions: {
        createEvent({ commit }, event) {
            commit('addEvent', event);
        },
        createPayment({ commit }, payment) {
            commit('addPayment', payment);
        },
        modifyEvent({ commit }, payload) {
            commit('updateEvent', payload);
        },
        removeEvent({ commit }, id) {
            commit('deleteEvent', id);
        }
    },
    getters: {
        allEvents: (state) => state.events,
        allPayments: (state) => state.payments,
        getEventById: (state) => (id) => state.events.find(event => event.id === id)
    }
});

export default store;