// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { supabase } from './helpers/supabaseConfig'

import Vuelidate from 'vuelidate'
// import TreeView from 'vue-json-tree-view'

import VueTour from 'vue-tour'
import VueCookies from 'vue-cookies'
import VTooltip from 'v-tooltip'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret, faFileImport, faEdit, faTrash, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { i18n } from './plugins/i18n'

import { longClickDirective } from 'vue-long-click'

library.add(faUserSecret, faFileImport, faEdit, faTrash, faPlay)

import 'vue-tour/dist/vue-tour.css'

Vue.use(Vuelidate)
Vue.use(VueTour)
Vue.use(VueCookies)
Vue.use(VTooltip)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.directive('longclick', longClickDirective({delay: 1200, interval: 0}))

VueCookies.config('365d')

Vue.config.productionTip = false
Vue.prototype.$lastUser = null
window.supabase = supabase

window.resetApp = () => {
  localStorage.clear()
  location.reload()
}

// Флаги для управления инициализацией
let isInitializing = false
let isRefreshingToken = false
let currentUserId = null

// Улучшенная функция инициализации пользователя
async function initializeUser(session, app, eventType = 'INITIAL') {
  console.log(`🔧 initializeUser called: ${eventType}`, session?.user?.id)
  
  // Защита от повторной инициализации для того же пользователя
  if (isInitializing && eventType !== 'TOKEN_REFRESHED') {
    console.log('⏳ Initialization already in progress, skipping...')
    return
  }

  // Для обновления токена - легкая версия инициализации
  if (eventType === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refresh detected')
    if (session && session.user) {
      Vue.prototype.$lastUser = session.user
      app.$lastUser = session.user
      // НЕ обновляем хранилище и НЕ загружаем данные
    }
    return
  }

  isInitializing = true
  
  try {
    if (session && session.user) {
      // Проверяем, не тот же ли пользователь
      if (currentUserId === session.user.id && eventType === 'SIGNED_IN') {
        console.log('👤 Same user, skipping reinitialization')
        return
      }
      
      console.log(`✅ ${eventType} user:`, session.user.id)
      currentUserId = session.user.id
      
      // Обновляем прототип Vue
      Vue.prototype.$lastUser = session.user
      app.$lastUser = session.user
      
      // Обновляем хранилище Vuex
      app.$store.commit('setUser', {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email,
        photoURL: session.user.user_metadata?.avatar_url,
        email: session.user.email
      })
      
      // Загружаем данные пользователя только при первом входе или смене пользователя
      if (eventType === 'INITIAL' || eventType === 'SIGNED_IN') {
        console.log('📥 Loading user data...')
        await Promise.all([
          app.$store.dispatch('loadNodes'),
          app.$store.dispatch('loadDeps'),
          app.$store.dispatch('loadTemplates')
        ])
        console.log('✅ User data loaded successfully')
      }
      
      // Редирект на главную если мы на странице входа
      if ((app.$route.name === 'signin' || app.$route.name === 'signup') && eventType !== 'TOKEN_REFRESHED') {
        app.$router.push('/')
      }
    } else {
      console.log('🚫 No user session')
      currentUserId = null
      
      // Если пользователя нет, очищаем состояние
      Vue.prototype.$lastUser = null
      app.$lastUser = null
      app.$store.commit('setUser', null)
      
      // Очищаем данные только при явном выходе
      if (eventType === 'SIGNED_OUT') {
        app.$store.commit('loadNodes', { target: 'elems', nodes: [] })
        app.$store.commit('loadDeps', { target: 'deps', deps: [] })
        app.$store.commit('loadTemplates', [])
      }
      
      // Редирект на страницу входа если требуется аутентификация
      if (app.$route.meta.requiresAuth && eventType !== 'TOKEN_REFRESHED') {
        app.$router.push('/signin')
      }
    }
  } catch (error) {
    console.error('❌ Error during user initialization:', error)
    app.$store.commit('setError', error.message)
  } finally {
    isInitializing = false
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>',
  async created () {
    // Сохраняем контекст Vue instance
    const app = this
    
    // Сначала проверяем существующую сессию
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting session:', error)
        return
      }
      
      console.log('📋 Initial session check:', session ? 'found' : 'not found')
      
      await initializeUser(session, app, 'INITIAL')
    } catch (error) {
      console.error('❌ Error during initial session check:', error)
    }
    
    // Затем настраиваем обработчик изменений состояния аутентификации
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state change:', event, session ? `user: ${session.user?.id}` : 'no session')
      
      // Обрабатываем события по-разному
      switch (event) {
        case 'TOKEN_REFRESHED':
          await initializeUser(session, app, 'TOKEN_REFRESHED')
          break
          
        case 'SIGNED_IN':
          // Небольшая задержка для избежания гонки условий
          setTimeout(async () => {
            await initializeUser(session, app, 'SIGNED_IN')
          }, 100)
          break
          
        case 'SIGNED_OUT':
          await initializeUser(null, app, 'SIGNED_OUT')
          break
          
        case 'USER_UPDATED':
          // Игнорируем обновления пользователя, если это не критично
          console.log('👤 User updated, skipping reinitialization')
          break
          
        default:
          console.log(`⚡ Skipping unhandled auth event: ${event}`)
      }
    })
  }
})