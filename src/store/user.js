import {supabase} from '../helpers/supabaseConfig'
import User from './UserModel'

export default {
  state: {
    user: null,
    lastUpdate: null
  },
  mutations: {
    setUser(state, payload) {
      // Проверяем, действительно ли изменился пользователь
      const currentId = state.user?.id
      const newId = payload?.id
      
      if (currentId !== newId) {
        state.user = payload
        state.lastUpdate = payload ? new Date().getTime() : null
        console.log('👤 User state updated:', payload ? payload.id : 'null')
      } else {
        console.log('👤 User state unchanged, skipping update')
      }
    },
    async loginUser ({commit}, {email, password}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          console.error('❌ Auth error:', error)
          // Специальная обработка ошибок аутентификации
          if (error.message.includes('session') || error.message.includes('token')) {
            throw new Error('Authentication session error. Please try again.')
          }
          throw error
        }
        
        const user = new User(
          data.user.id, 
          data.user.user_metadata?.full_name || data.user.email, 
          data.user.user_metadata?.avatar_url,
          data.user.email
        )
        commit('setUser', user)
        commit('setLoading', false)
        
        return user
      } catch (error) {
        console.error('❌ Login failed:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    // Logged
    loggedUser ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setUser', new User(payload.uid, payload.displayName, payload.photoURL, payload.email))
    },
    // Logout
    async logoutUser ({commit}) {
      await supabase.auth.signOut()
      // Send mutation null
      commit('setUser', null)
    },
    // Сохранение email пользователя в Supabase, если ранее не был сохранен
    async persistEmail ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        console.log('getters.user', getters.user)
        if (getters.user) {
          // Check if userdata exists
          const { data: userdata, error: fetchError } = await supabase
            .from('userdata')
            .select('email')
            .eq('id', getters.user.id)
            .single()
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError
          }
          
          // Если email не существует в Supabase
          if (!userdata || !userdata.email) {
            // создаем или обновляем запись в Supabase
            const { error: upsertError } = await supabase
              .from('userdata')
              .upsert({
                id: getters.user.id,
                email: getters.user.email
              })
            
            if (upsertError) throw upsertError
          }
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
    // Return user (for get id)
    user (state) {
      return state.user
    },
    // Check User (for logged)
    checkUser (state) {
      return state.user !== null
    }
  }
}
