import {supabase} from '../helpers/supabaseConfig'
import Dep from './DependencyModel'

export default ({
  state: {
    deps: [],
    templateDeps: []
  },
  mutations: {
    newDep (
      state,
      {
        id,
        fromNodeId,
        toNodeId
      }
    ) {
      state.deps.push({
        id,
        fromNodeId,
        toNodeId
      })
    },
    newTempDep (
      state,
      {
        id,
        fromNodeId,
        toNodeId,
        templateId
      }
    ) {
      state.templateDeps.push({
        id,
        fromNodeId,
        toNodeId,
        templateId
      })
    },
    loadDeps (state, payload) {
      console.log('🔄 Mutation: loadDeps', payload.target, 'deps count:', payload.deps.length)
      state[payload.target] = payload.deps
    },
    deleteDep (state, payload) {
      const deletedDep = state[payload.target].find(dep => dep.id === payload.id)
      if (deletedDep) {
        state[payload.target].splice(state[payload.target].indexOf(deletedDep), 1)
      }
    }
  },
  actions: {
    async newDep ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newDep = new Dep(
          payload.fromNodeId,
          payload.toNodeId
        )
        
        const { data: dep, error } = await supabase
          .from('dependencies')
          .insert({
            user_id: getters.user.id,
            from_node_id: newDep.fromNodeId,
            to_node_id: newDep.toNodeId
          })
          .select()
          .single()
        
        if (error) throw error
        
        // Send mutation
        commit('newDep', {
          ...newDep,
          id: dep.id
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async newTemplateDep ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newDep = new Dep(
          payload.fromNodeId,
          payload.toNodeId
        )
        
        const { data: dep, error } = await supabase
          .from('template_dependencies')
          .insert({
            template_id: payload.templateId || getters.currentTemplateId,
            from_node_id: newDep.fromNodeId,
            to_node_id: newDep.toNodeId
          })
          .select()
          .single()
        
        if (error) throw error
        
        // Send mutation
        commit('newTempDep', {
          ...newDep,
          templateId: payload.templateId || getters.currentTemplateId,
          id: dep.id
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async loadDeps ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const { data: deps, error } = await supabase
          .from('dependencies')
          .select('*')
          .eq('user_id', getters.user.id)
        
        if (error) throw error
        
        if (deps && deps.length > 0) {
          const depsArray = []
          deps.forEach(dep => {
            depsArray.push(
              new Dep(
                dep.from_node_id,
                dep.to_node_id,
                dep.id
              )
            )
          })
          
          const payload = {
            target: 'deps',
            deps: depsArray
          }
          commit('loadDeps', payload)
        } else {
          // Если зависимостей нет, очищаем state
          commit('loadDeps', { target: 'deps', deps: [] })
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async loadTemplateDeps ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const currentTemplateId = getters.currentTemplateId
        const userId = getters.user?.id
        
        console.log('🔄 Loading template dependencies:', {
          templateId: currentTemplateId,
          userId: userId
        })
        
        if (!currentTemplateId) {
          console.log('ℹ️ No template selected, clearing dependencies')
          commit('loadDeps', { target: 'templateDeps', deps: [] })
          commit('setLoading', false)
          return
        }
        
        if (!userId) {
          console.error('❌ No user ID available')
          throw new Error('User not authenticated')
        }
        
        // Загружаем зависимости шаблона
        const { data: deps, error } = await supabase
          .from('template_dependencies')
          .select(`
            *,
            from_node:template_nodes!template_dependencies_from_node_id_fkey(id, title),
            to_node:template_nodes!template_dependencies_to_node_id_fkey(id, title)
          `)
          .eq('template_id', currentTemplateId)
        
        if (error) {
          console.error('❌ Error loading template dependencies:', error)
          throw error
        }
        
        console.log('🔗 Template dependencies loaded:', deps?.length || 0, deps)
        
        const depsArray = []
        if (deps && deps.length > 0) {
          deps.forEach(dep => {
            // Проверяем, что связанные узлы существуют
            if (dep.from_node_id && dep.to_node_id) {
              depsArray.push(
                new Dep(
                  dep.from_node_id,
                  dep.to_node_id,
                  dep.id
                )
              )
            } else {
              console.warn('⚠️ Skipping dependency with missing nodes:', dep)
            }
          })
        }
        
        // Send mutation
        const payload = {
          target: 'templateDeps',
          deps: depsArray
        }
        commit('loadDeps', payload)
        commit('setLoading', false)
        console.log('✅ Template dependencies loaded successfully')
        
      } catch (error) {
        console.error('❌ Error in loadTemplateDeps:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async deleteDep ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const { error } = await supabase
          .from('dependencies')
          .delete()
          .eq('id', id)
          .eq('user_id', getters.user.id)
        
        if (error) throw error
        
        const payload = {
          id,
          target: 'deps'
        }
        commit('deleteDep', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async deleteTemplateDep ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const { error } = await supabase
          .from('template_dependencies')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        const payload = {
          id,
          target: 'templateDeps'
        }
        commit('deleteDep', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    deps (state) {
      return state.deps
    },
    templateDeps (state) {
      return state.templateDeps
    }
  }
})