import { supabase } from '../helpers/supabaseConfig'
import { i18n } from '../plugins/i18n'
import Cookie from 'js-cookie'

export default {
  state: {
    locale: 'en'
  },
  mutations: {
    setLocale (state, payload) {
      import(`../lang/${payload}.json`)
        .then((msgs) => {
          i18n.setLocaleMessage(payload, msgs)
          i18n.locale = payload
          state.locale = payload
        })
    }
  },
  actions: {
    async setLocale ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        if (getters.user) {
          // Update user locale in Supabase
          const { error } = await supabase
            .from('userdata')
            .upsert({
              id: getters.user.id,
              locale: payload
            })
          
          if (error) throw error
        } else {
          Cookie.set('locale', payload)
        }
        commit('setLocale', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadLocale ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // пытаемся получить локаль из удаленного хранилища
        const { data: userdata, error } = await supabase
          .from('userdata')
          .select('locale')
          .eq('id', getters.user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          throw error
        }
        
        // пытаемся достать локаль из куки
        const cookiesLocale = Cookie.get('locale')
        if (cookiesLocale) {
          // Если в куки была локаль, обновляем ее в Supabase
          if (userdata) {
            await supabase
              .from('userdata')
              .update({ locale: cookiesLocale })
              .eq('id', getters.user.id)
          } else {
            await supabase
              .from('userdata')
              .insert({ id: getters.user.id, locale: cookiesLocale })
          }
          // ... и устанавливаем ее текущей локально
          commit('setLocale', cookiesLocale)
          // Удаляем локаль из куки
          Cookie.remove('locale')
        } else if (userdata && userdata.locale) {
          // Иначе - если пришла локаль из удаленного хранилища -
          // Устанавливаем ее текущей
          commit('setLocale', userdata.locale)
        }
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    locale (state) {
      return state.locale
    }
  }
}
