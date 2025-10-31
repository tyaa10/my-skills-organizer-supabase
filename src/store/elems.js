import {supabase} from '../helpers/supabaseConfig'
import Node from './NodeModel'

export default ({
  state: {
    // Локальный массив элементов для отображения (моделей узлов целей)
    elems: [],
    // ... для узлов шаблона, выбранного в разделе "Шаблоны"
    templateElems: [],
    // Последний созданный элемент (узел)
    lastCreatedElemId: null,
    lastCreatedTemplateElemId: null
  },
  mutations: {
    newNode (
      state,
      {
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left
      }
    ) {
      state.elems.push({
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left
      })
      state.lastCreatedElemId = id
    },
    newTemplateNode (
      state,
      {
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left,
        templateId
      }
    ) {
      state.templateElems.push({
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left,
        templateId
      })
      state.lastCreatedTemplateElemId = id
    },
    loadNodes (state, payload) {
      console.log('🔄 Mutation: loadNodes', payload.target, 'nodes count:', payload.nodes.length)
      state[payload.target] = payload.nodes
      // Сбрасываем ID последнего созданного элемента
      if (payload.target === 'templateElems') {
        state.lastCreatedTemplateElemId = null
      } else {
        state.lastCreatedElemId = null
      }
    },
    editNode (state, payload) {
      const oldElem = state[payload.target].find(elem => elem.id === payload.id)
      const newElem = {
        id: oldElem.id,
        title: (payload.title !== undefined) ? payload.title : oldElem.title,
        type: (payload.type !== undefined) ? payload.type : oldElem.type,
        description: (payload.description !== undefined) ? payload.description : oldElem.description,
        access: (payload.access !== undefined) ? payload.access : oldElem.access,
        status: (payload.status !== undefined) ? payload.status : oldElem.status,
        dependenciesSatisfied: (payload.dependenciesSatisfied !== undefined) ? payload.dependenciesSatisfied : oldElem.dependenciesSatisfied,
        radius: (payload.radius !== undefined) ? payload.radius : oldElem.radius,
        left: (payload.left !== undefined) ? payload.left : oldElem.left,
        top: (payload.top !== undefined) ? payload.top : oldElem.top
      }
      if (newElem.templateId !== undefined) {
        newElem.templateId = oldElem.templateId
      }
      Object.assign(oldElem, newElem)
    },
    deleteNode (state, payload) {
      const deletedNode = state[payload.target].find(elem => elem.id === payload.id)
      state[payload.target].splice(state[payload.target].indexOf(deletedNode), 1)
    }
  },
  actions: {
    /* Create new Node */
    async newNode ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      console.log((new Date()).toISOString())
      try {
        // Use helped class
        const newNode = new Node(
          payload.title,
          payload.type,
          payload.description,
          payload.access,
          payload.status,
          payload.dependenciesSatisfied,
          payload.radius,
          payload.left,
          payload.top
        )
        const nowDateISOString = (new Date()).toISOString()
        
        // Insert new node into Supabase
        const { data: node, error: nodeError } = await supabase
          .from('nodes')
          .insert({
            user_id: getters.user.id,
            title: newNode.title,
            type: newNode.type,
            description: newNode.description,
            access: newNode.access,
            status: newNode.status,
            dependencies_satisfied: newNode.dependenciesSatisfied,
            radius: newNode.radius,
            top: newNode.top,
            left_pos: newNode.left,
            created_at: nowDateISOString
          })
          .select()
          .single()
        
        if (nodeError) throw nodeError
        
        // Update userdata with nodesUpdatedAt
        const { error: userdataError } = await supabase
          .from('userdata')
          .upsert({
            id: getters.user.id,
            nodes_updated_at: nowDateISOString
          })
        
        if (userdataError) throw userdataError
        
        // Send mutation
        commit('newNode', {
          ...newNode,
          id: node.id
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async newTemplateNode ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newNode = new Node(
          payload.title,
          payload.type,
          payload.description,
          payload.access,
          payload.status,
          payload.dependenciesSatisfied,
          payload.radius,
          payload.left,
          payload.top
        )
        
        const { data: node, error } = await supabase
          .from('template_nodes')
          .insert({
            template_id: payload.templateId || getters.currentTemplateId,
            title: newNode.title,
            type: newNode.type,
            description: newNode.description,
            access: newNode.access,
            status: newNode.status,
            dependencies_satisfied: newNode.dependenciesSatisfied,
            radius: newNode.radius,
            top: newNode.top,
            left_pos: newNode.left
          })
          .select()
          .single()
        
        if (error) throw error
        
        // Send mutation
        commit('newTemplateNode', {
          ...newNode,
          templateId: payload.templateId || getters.currentTemplateId,
          id: node.id
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async loadNodes ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const { data: nodes, error } = await supabase
          .from('nodes')
          .select('*')
          .eq('user_id', getters.user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        if (nodes && nodes.length > 0) {
          // New array
          const nodesArray = []
          // Convert to Node objects
          nodes.forEach(node => {
            nodesArray.push(
              new Node(
                node.title,
                node.type,
                node.description,
                node.access,
                node.status,
                node.dependencies_satisfied,
                node.radius,
                node.left_pos,
                node.top,
                node.id
              )
            )
          })
          const payload = {
            target: 'elems',
            nodes: nodesArray
          }
          // Send mutation
          commit('loadNodes', payload)
        } else {
          // Если узлов нет, очищаем state
          commit('loadNodes', { target: 'elems', nodes: [] })
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async loadTemplateNodes ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const currentTemplateId = getters.currentTemplateId
        console.log('🔄 Loading template nodes for template:', currentTemplateId)
        
        if (!currentTemplateId) {
          console.log('ℹ️ No template selected, clearing nodes')
          commit('loadNodes', { target: 'templateElems', nodes: [] })
          commit('setLoading', false)
          return
        }
        
        const { data: nodes, error } = await supabase
          .from('template_nodes')
          .select('*')
          .eq('template_id', currentTemplateId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Error loading template nodes:', error)
          throw error
        }
        
        console.log('📋 Template nodes loaded:', nodes?.length || 0)
        
        // New array
        const nodesArray = []
        if (nodes && nodes.length > 0) {
          // Convert to Node objects
          nodes.forEach(node => {
            nodesArray.push(
              new Node(
                node.title,
                node.type,
                node.description,
                node.access,
                node.status,
                node.dependencies_satisfied,
                node.radius,
                node.left_pos,
                node.top,
                node.id
              )
            )
          })
        }
        
        const payload = {
          target: 'templateElems',
          nodes: nodesArray
        }
        // Send mutation
        commit('loadNodes', payload)
        commit('setLoading', false)
      } catch (error) {
        console.error('❌ Error in loadTemplateNodes:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async editNode ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields in Supabase
        const updateData = {}
        if (changes.title !== undefined) updateData.title = changes.title
        if (changes.type !== undefined) updateData.type = changes.type
        if (changes.description !== undefined) updateData.description = changes.description
        if (changes.access !== undefined) updateData.access = changes.access
        if (changes.status !== undefined) updateData.status = changes.status
        if (changes.dependenciesSatisfied !== undefined) updateData.dependencies_satisfied = changes.dependenciesSatisfied
        if (changes.radius !== undefined) updateData.radius = changes.radius
        if (changes.left !== undefined) updateData.left_pos = changes.left
        if (changes.top !== undefined) updateData.top = changes.top
        
        const { error } = await supabase
          .from('nodes')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', getters.user.id)
        
        if (error) throw error
        
        // Send mutation
        commit('editNode', {id, target: 'elems', ...changes})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async editTemplateNode ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields in Supabase
        const updateData = {}
        if (changes.title !== undefined) updateData.title = changes.title
        if (changes.type !== undefined) updateData.type = changes.type
        if (changes.description !== undefined) updateData.description = changes.description
        if (changes.access !== undefined) updateData.access = changes.access
        if (changes.status !== undefined) updateData.status = changes.status
        if (changes.dependenciesSatisfied !== undefined) updateData.dependencies_satisfied = changes.dependenciesSatisfied
        if (changes.radius !== undefined) updateData.radius = changes.radius
        if (changes.left !== undefined) updateData.left_pos = changes.left
        if (changes.top !== undefined) updateData.top = changes.top
        
        const { error } = await supabase
          .from('template_nodes')
          .update(updateData)
          .eq('id', id)
        
        if (error) throw error
        
        // Send mutation
        commit('editNode', {id, target: 'templateElems', ...changes})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async deleteNode ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        console.log('🗑️ Deleting node with CASCADE:', id)
        
        // Теперь можно удалить просто узел - зависимости удалятся автоматически
        const { error } = await supabase
          .from('nodes')
          .delete()
          .eq('id', id)
          .eq('user_id', getters.user.id)
        
        if (error) throw error
        
        commit('deleteNode', {id, target: 'elems'})
        commit('setLoading', false)
        console.log('✅ Node deleted successfully with CASCADE')
        
      } catch (error) {
        console.error('❌ Error deleting node:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    
    async deleteTemplateNode ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        console.log('🗑️ Deleting template node with CASCADE:', id)
        
        // Теперь можно удалить просто узел - зависимости удалятся автоматически
        const { error } = await supabase
          .from('template_nodes')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        commit('deleteNode', {id, target: 'templateElems'})
        commit('setLoading', false)
        console.log('✅ Template node deleted successfully with CASCADE')
        
      } catch (error) {
        console.error('❌ Error in deleteTemplateNode:', error)
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    elems (state) {
      return state.elems
    },
    templateElems (state) {
      return state.templateElems
    },
    lastCreatedElemId (state) {
      return state.lastCreatedElemId
    },
    lastCreatedTemplateElemId (state) {
      return state.lastCreatedTemplateElemId
    }
  }
})