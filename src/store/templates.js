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
    
    // Импорт шаблона из другого аккаунта
    async importTemplate ({commit, dispatch, getters}, {importUserId, importTemplateId}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        console.log('🔍 Importing template:', { importUserId, importTemplateId })
        
        // Получаем шаблон для импорта
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .select('*')
          .eq('id', importTemplateId)
          .eq('access', true)
          .single()
        
        if (templateError) {
          console.error('❌ Template fetch error:', templateError)
          throw new Error(`Template not found or not accessible: ${templateError.message}`)
        }
        
        if (!template) {
          throw new Error('Template not found or not publicly accessible')
        }
        
        console.log('✅ Template found:', template)
        
        // Создаем новый шаблон
        const { data: newTemplate, error: createError } = await supabase
          .from('templates')
          .insert({
            user_id: getters.user.id,
            title: template.title + ' (imported)',
            description: template.description,
            access: template.access
          })
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Error creating template:', createError)
          throw new Error(`Failed to create template: ${createError.message}`)
        }
        
        const newTemplateId = newTemplate.id
        console.log('📝 New template created:', newTemplateId)
        
        // Устанавливаем текущий шаблон
        commit('setCurrentTemplateId', newTemplateId)
        
        // Получаем узлы шаблона для импорта
        const { data: templateNodes, error: nodesError } = await supabase
          .from('template_nodes')
          .select('*')
          .eq('template_id', importTemplateId)
        
        if (nodesError) {
          console.error('❌ Template nodes fetch error:', nodesError)
          throw new Error(`Failed to fetch template nodes: ${nodesError.message}`)
        }
        
        console.log('📋 Template nodes found:', templateNodes?.length || 0)
        
        const templateNodesDictionary = {}
        
        if (templateNodes && templateNodes.length > 0) {
          // Копируем узлы последовательно
          for (const node of templateNodes) {
            console.log('📦 Copying node:', node.title)
            
            // Создаем узел напрямую через Supabase
            const { data: newNode, error: nodeError } = await supabase
              .from('template_nodes')
              .insert({
                template_id: newTemplateId,
                title: node.title,
                type: node.type,
                description: node.description,
                access: node.access,
                status: node.status,
                dependencies_satisfied: node.dependencies_satisfied,
                radius: node.radius,
                top: node.top,
                left_pos: node.left_pos
              })
              .select()
              .single()
            
            if (nodeError) {
              console.error('❌ Error creating template node:', nodeError)
              throw new Error(`Failed to create template node: ${nodeError.message}`)
            }
            
            templateNodesDictionary[node.id] = newNode.id
            console.log(`🆔 Node mapping: ${node.id} -> ${newNode.id}`)
            
            // Добавляем небольшую паузу между запросами
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          console.log('🗂️ Node mapping completed:', templateNodesDictionary)
        }
        
        // Получаем зависимости шаблона
        const { data: templateDeps, error: depsError } = await supabase
          .from('template_dependencies')
          .select('*')
          .eq('template_id', importTemplateId)
        
        if (depsError) {
          console.error('❌ Template dependencies fetch error:', depsError)
          throw new Error(`Failed to fetch template dependencies: ${depsError.message}`)
        }
        
        console.log('🔗 Template dependencies found:', templateDeps?.length || 0)
        
        // Копируем зависимости
        if (templateDeps && templateDeps.length > 0) {
          let createdDepsCount = 0
          
          for (const dep of templateDeps) {
            const fromNodeId = templateNodesDictionary[dep.from_node_id]
            const toNodeId = templateNodesDictionary[dep.to_node_id]
            
            if (fromNodeId && toNodeId) {
              console.log(`🔗 Copying dependency: ${dep.from_node_id}->${dep.to_node_id} => ${fromNodeId}->${toNodeId}`)
              
              const { data: newDep, error: depError } = await supabase
                .from('template_dependencies')
                .insert({
                  template_id: newTemplateId,
                  from_node_id: fromNodeId,
                  to_node_id: toNodeId
                })
                .select()
                .single()
              
              if (depError) {
                console.error('❌ Error creating template dependency:', depError)
                console.log('Dependency data:', {
                  template_id: newTemplateId,
                  from_node_id: fromNodeId,
                  to_node_id: toNodeId
                })
                throw new Error(`Failed to create template dependency: ${depError.message}`)
              }
              
              createdDepsCount++
              console.log(`✅ Dependency created: ${newDep.id}`)
              
              // Добавляем небольшую паузу между запросами
              await new Promise(resolve => setTimeout(resolve, 100))
            } else {
              console.warn('⚠️ Skipping dependency - node mapping not found:', {
                originalFrom: dep.from_node_id,
                originalTo: dep.to_node_id,
                mappedFrom: fromNodeId,
                mappedTo: toNodeId
              })
            }
          }
          
          console.log(`✅ Created ${createdDepsCount} dependencies`)
        } else {
          console.log('ℹ️ No dependencies to import')
        }
        
        // Добавляем новый шаблон в состояние Vuex
        commit('newTemplate', {
          id: newTemplateId,
          title: newTemplate.title,
          description: newTemplate.description,
          access: newTemplate.access
        })
        
        console.log('✅ Template import completed successfully')
        
        // Возвращаем результат для отладки
        return { 
          success: true, 
          message: 'Template imported successfully', 
          templateId: newTemplateId,
          nodesImported: templateNodes?.length || 0,
          depsImported: templateDeps?.length || 0
        }
        
      } catch (error) {
        console.error('❌ Template import error:', error)
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