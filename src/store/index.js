import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'
// import * as Cookies from 'js-cookie'

import elems from './elems'
import user from './user'
import deps from './dependencies'
import common from './common'
import templates from './templates'
import lang from './lang'

// import { promiseTracker } from '@/utils/promiseTracker'

// Перехватчик для всех действий Vuex
/* const promiseTrackingMiddleware = (store) => {
  store.subscribeAction({
    before: (action) => {
      promiseTracker.track(
        new Promise((resolve) => {
          // Этот промис завершится когда действие закончится
          const originalDispatch = store.dispatch
          store.dispatch = function (...args) {
            const result = originalDispatch.apply(this, args)
            if (result && typeof result.then === 'function') {
              result.finally(resolve)
            } else {
              resolve()
            }
            return result
          }
        }),
        `VUEX:${action.type}`
      )
    }
  })
} */

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    elems, user, common, deps, templates, lang
  }/* ,
  plugins: [promiseTrackingMiddleware] *//* ,
  plugins: [createPersistedState()] */
})
