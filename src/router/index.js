import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import EventDetailView from '../views/EventDetailView.vue'

const routes = [
    {
        path: '/',
        name: 'Calendar',
        component: CalendarView
    },
    {
        path: '/event/:id',
        name: 'EventDetail',
        component: EventDetailView,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router