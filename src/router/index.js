import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/api/client'

const routes = [
  { path: '/login',         name: 'Login',        component: () => import('@/views/LoginView.vue'),        meta: { public: true } },
  { path: '/',              redirect: '/entries' },
  { path: '/entries',       name: 'Entries',      component: () => import('@/views/EntriesView.vue') },
  { path: '/expense-types', name: 'ExpenseTypes', component: () => import('@/views/ExpenseTypesView.vue') },
  { path: '/scheduled',     name: 'Scheduled',    component: () => import('@/views/ScheduledView.vue') },
  { path: '/summaries',     name: 'Summaries',    component: () => import('@/views/SummariesView.vue') },
  { path: '/profile',       name: 'Profile',      component: () => import('@/views/ProfileView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const hasToken = !!getAccessToken()
  if (!to.meta.public && !hasToken) return '/login'
  if (to.path === '/login' && hasToken) return '/entries'
})

export default router
