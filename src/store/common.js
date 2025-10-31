export default {
  state: {
    loading: false,
    error: null,
    _loadingStack: 0 // Счетчик для вложенных операций
  },
  mutations: {
    setLoading (state, payload) {
      if (payload === true) {
        state._loadingStack++
        state.loading = true
        console.log('🔄 Loading START, stack:', state._loadingStack)
      } else {
        state._loadingStack = Math.max(0, state._loadingStack - 1)
        state.loading = state._loadingStack > 0
        console.log('🔄 Loading END, stack:', state._loadingStack, 'still loading:', state.loading)
      }
    },
    setError (state, payload) {
      state.error = payload
      state._loadingStack = 0
      state.loading = false
      console.error('💥 Error set:', payload)
    },
    clearError (state) {
      state.error = null
    },
    resetLoadingStack (state) {
      console.warn('⚠️ Force resetting loading stack')
      state._loadingStack = 0
      state.loading = false
    }
  },
  actions: {
    setError ({commit}, payload) {
      commit('setError', payload)
    },
    clearError ({commit}) {
      commit('clearError')
    },
    setLoading ({commit}, payload) {
      commit('setLoading', payload)
    },
    resetLoading ({commit}) {
      commit('resetLoadingStack')
    }
  },
  getters: {
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    },
    loadingStack (state) {
      return state._loadingStack // ДОБАВЬТЕ ЭТОТ ГЕТТЕР
    }
  }
}