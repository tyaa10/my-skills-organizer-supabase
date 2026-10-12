import {supabase} from '../helpers/supabaseConfig'
import Template from './TemplateModel'

export default ({
  state: {
    temps: [],
    currentTemplateId: null
  },
  mutations: {
    setCurrentTemplateId (state, payload) {
      state.currentTemplateId = payload
    },
    newTemplate (
      state,
      {
        id,
        title,
        description,
        access
      }
    ) {
      state.temps.push({
        id,
        title,
        description,
        access
      })
    },
    loadTemplates (state, payload) {
      state.temps = payload
    },
    editTemplate (state, payload) {
      const oldTemp = state.temps.find(temp => temp.id === payload.id)
      const newTemp = {
        id: oldTemp.id,
        title: (payload.title !== undefined) ? payload.title : oldTemp.title,
        description: (payload.description !== undefined) ? payload.description : oldTemp.description,
        access: (payload.access !== undefined) ? payload.access : oldTemp.access
      }
      Object.assign(oldTemp, newTemp)
    },
    async deleteTemplate ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const templateId = id || getters.currentTemplateId
        
        if (!templateId) {
          throw new Error('No template selected for deletion')
        }
        
        console.log('🗑️ Deleting template via function:', templateId)
        
        // Вызываем функцию удаления
        const { error } = await supabase
          .rpc('delete_template', {
            template_uuid: templateId,
            user_uuid: getters.user.id
          })
        
        if (error) {
          console.error('❌ Error in delete_template function:', error)
          throw error
        }
        
        commit('deleteTemplate', {id: templateId})
        commit('setLoading', false)
        
        console.log('✅ Template deleted successfully via function')
        
      } catch (error) {
        console.error('❌ Error deleting template:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  actions: {
    /* Create a new Template */
    async newTemplate ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newTemplate = new Template(
          payload.title,
          payload.description,
          payload.access
        )
        
        const { data: template, error } = await supabase
          .from('templates')
          .insert({
            user_id: getters.user.id,
            title: newTemplate.title,
            description: newTemplate.description,
            access: newTemplate.access
          })
          .select()
          .single()
        
        if (error) throw error
        
        // Send mutations
        commit('setCurrentTemplateId', template.id)
        commit('newTemplate', {
          ...newTemplate,
          id: template.id
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    // Загрузить список шаблонов
    // Загрузить список шаблонов
    async loadTemplates ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        console.log('🔄 Loading templates for user:', getters.user?.id)
        
        const { data: templates, error } = await supabase
          .from('templates')
          .select('*')
          .eq('user_id', getters.user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Error loading templates:', error)
          throw error
        }
        
        console.log('📋 Templates loaded:', templates?.length || 0)
        
        if (templates && templates.length > 0) {
          // New array
          const templatesArray = []
          // Convert to Template objects
          templates.forEach(template => {
            templatesArray.push(
              new Template(
                template.title,
                template.description,
                template.access,
                template.id
              )
            )
          })
          // Send mutation
          commit('loadTemplates', templatesArray)
        } else {
          // Если шаблонов нет, очищаем state
          console.log('ℹ️ No templates found for user')
          commit('loadTemplates', [])
        }

        commit('setLoading', false)
      } catch (error) {
        console.error('❌ Error in loadTemplates:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async editTemplate ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields in Supabase
        const updateData = {}
        if (changes.title !== undefined) updateData.title = changes.title
        if (changes.description !== undefined) updateData.description = changes.description
        if (changes.access !== undefined) updateData.access = changes.access
        
        const { error } = await supabase
          .from('templates')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', getters.user.id)
        
        if (error) throw error
        
        // Send mutation
        commit('editTemplate', {id, ...changes})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async deleteTemplate ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const templateId = id || getters.currentTemplateId
        
        if (!templateId) {
          throw new Error('No template selected for deletion')
        }
        
        console.log('🗑️ Deleting template with CASCADE:', templateId)
        
        // Теперь можно удалить просто шаблон - зависимости и узлы удалятся автоматически
        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', templateId)
          .eq('user_id', getters.user.id)
        
        if (error) {
          console.error('❌ Error deleting template:', error)
          throw error
        }
        
        commit('deleteTemplate', {id: templateId})
        commit('setLoading', false)
        
        console.log('✅ Template deleted successfully with CASCADE')
        
      } catch (error) {
        console.error('❌ Error deleting template:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async setCurrentTemplateId ({commit}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        commit('setCurrentTemplateId', id)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async importTemplateFromFile ({commit, getters, dispatch}, templateData) {
      commit('clearError')
      commit('setLoading', true)
      
      try {
        const userId = getters.user?.id
        if (!userId) {
          throw new Error('User not authenticated')
        }

        // 1. Создаем шаблон
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .insert({
            user_id: userId,
            title: templateData.title,
            description: templateData.description,
            access: true
          })
          .select()
          .single()

        if (templateError) throw new Error(`Failed to create template: ${templateError.message}`)

        const newTemplateId = template.id

        // 2. Создаем узлы и строим маппинг локальных ID в реальные UUID
        const nodeIdMap = {}
        const nodesToInsert = templateData.nodes.map(node => ({
          template_id: newTemplateId,
          title: node.title,
          type: node.type || '1',
          description: node.description || '',
          access: node.access !== undefined ? node.access : true,
          status: node.status || '1',
          dependencies_satisfied: node.dependenciesSatisfied !== undefined ? node.dependenciesSatisfied : true,
          radius: node.radius || 50,
          top: node.top || 0,
          left_pos: node.left || 0
        }))

        const { data: insertedNodes, error: nodesError } = await supabase
          .from('template_nodes')
          .insert(nodesToInsert)
          .select()

        if (nodesError) throw new Error(`Failed to create nodes: ${nodesError.message}`)

        templateData.nodes.forEach((node, index) => {
          nodeIdMap[node.id] = insertedNodes[index].id
        })

        // 3. Создаем зависимости
        if (templateData.dependencies && templateData.dependencies.length > 0) {
          const depsToInsert = templateData.dependencies.map(dep => ({
            template_id: newTemplateId,
            from_node_id: nodeIdMap[dep.from],
            to_node_id: nodeIdMap[dep.to]
          })).filter(dep => dep.from_node_id && dep.to_node_id) // Фильтруем на случай ошибок маппинга

          if (depsToInsert.length > 0) {
            const { error: depsError } = await supabase
              .from('template_dependencies')
              .insert(depsToInsert)

            if (depsError) throw new Error(`Failed to create dependencies: ${depsError.message}`)
          }
        }

        // 4. Обновляем состояние Vuex
        commit('newTemplate', {
          id: newTemplateId,
          title: template.title,
          description: template.description,
          access: template.access
        })
        commit('setCurrentTemplateId', newTemplateId)
        commit('setLoading', false)

        return {
          success: true,
          templateId: newTemplateId
        }

      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    temps (state) {
      return state.temps
    },
    currentTemplateId (state) {
      return state.currentTemplateId
    }
  }
})