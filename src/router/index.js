import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home.vue'
import Templates from '@/components/Templates.vue'
import SignIn from '@/components/Auth/SignIn.vue'
import SignUp from '@/components/Auth/SignUp.vue'
import About from '@/components/About.vue'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/templates',
      name: 'templates',
      component: Templates,
      meta: { requiresAuth: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
      meta: { requiresGuest: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp,
      meta: { requiresGuest: true }
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

// Навигационный гард
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // Инициализируем пользователя из сессии если нужно
  /* if (!store.getters.checkUser && requiresAuth) {
    try {
      await store.dispatch('initializeUserFromSession')
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  } */
  
  const isAuthenticated = store.getters.checkUser
  
  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  } else if (requiresGuest && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router