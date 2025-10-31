<template lang="pug">
.content-wrapper
  // В верхней части разметки располагаем представления для всплывающих
  // сообщений из библиотеки uimini
  #cancelledMessage.ui-message.ui-message--danger
    span.message-title {{$t('templates.messages.cancelled')}}
  #doneMessage.ui-message.ui-message--success
    span.message-title {{$t('templates.messages.done')}}
  #errorMessage.ui-message.ui-message--danger
    span.message-title {{$t('templates.messages.error')}}
  // Секция, содержащая экземпляр пользовательского компонента FabricCanvas
  // для отображения дерева целей и задач текущего шаблона
  .templateData(v-if="currentUserId && currentTemplateId && selectedTemplate.title")
    span.ui-title-4 {{$t('templates.header.template')}}:
    = ' '
    span.ui-text-regular "{{selectedTemplate.title}}".
    = ' '
    span.ui-title-4(v-if="selectedTemplate.access") {{$t('templates.header.accessible_by_id')}}:
    = ' '
    span.ui-text-regular(v-if="selectedTemplate.access") {{currentUserId}}@{{currentTemplateId}}
  section#c(ref='canvasContainer' @click='hideRightSidebar')
    FabricCanvas(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames", ref="fabricCanvasHandler")
  .right-sidebar.full
    .button.button-default.right-sidebar-toggle-button#templatesSidebarOpenButton(@click='toggleTemplatesSidebar')
      span(v-if="!templatesSidebarShown") &lt;
      span(v-else) &gt;
    .container
      .sidebar-content
        .button.button-default.templates-actions-button(@click='addTempClick' v-tooltip="$t('templates.action_icons.add')") +
        .button.button-default.templates-actions-button(@click='importTempClick' v-tooltip.top-center="$t('templates.action_icons.import')")
          font-awesome-icon(:icon="'file-import'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='editTempClick' v-tooltip.top-center="$t('templates.action_icons.edit')")
          font-awesome-icon(:icon="'edit'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='delTempClick' v-tooltip.top-center="$t('templates.action_icons.delete')")
          font-awesome-icon(:icon="'trash'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='useTempClick' v-tooltip.top-center="$t('templates.action_icons.use')") u
        .sidebar-list
          transition-group
            .sidebar-item.templates-item(
              v-for="temp in temps"
              :key="temp.id"
              :class="{ public: temp.access, selected: (currentTemplateId === temp.id) }"
              v-on:click="templatesItemClick(temp.id)"
            )
              p.ui-text-regular {{ temp.title }}
  // Dialog Box - Template
  .ui-messageBox__wrapper#templatesModal
    .ui-messageBox.fadeInDown
      .ui-messageBox__header
        span.messageBox-title {{formStaticContent[tempFormMode].title}}
        span.button-close.ui-messageBox-close
      .ui-messageBox__content
        span {{formStaticContent[tempFormMode].description}}
        // /* Форма создания / редактирования Template. */
        // Подавление стандартной отправки пост-запроса формой
        form(v-if="tempFormMode == 'create' || tempFormMode == 'edit'" v-on:submit.prevent='')
          // Привязка блока с полем ввода к свойству модели
          // с указанием текстов ошибок валидации
          .form-item(:class="{ 'form-group--error': $v.selectedTemplate.title.$error }")
            label.form__label(for='titleInput') {{$t('templates.dialogs.create.title')}}
            // Поле ввода заголовка Template
            input.form__input#titleInput(type='text' :placeholder="$t('templates.dialogs.create.title_input.label')" v-model.trim="$v.selectedTemplate.title.$model")
          .error(v-if="!$v.selectedTemplate.title.required") {{$t('templates.dialogs.create.title_input.required_error')}}
          .error(v-if="!$v.selectedTemplate.title.minLength") {{$t('templates.dialogs.create.title_input.at_least_error', {number: $v.selectedTemplate.title.$params.minLength.min})}}
          .error(v-if="!$v.selectedTemplate.title.maxLength") {{$t('templates.dialogs.create.title_input.at_most_error', {number: $v.selectedTemplate.title.$params.maxLength.max})}}
          .form-item(:class="{ 'form-group--error': $v.selectedTemplate.description.$error }")
            label.form__label(for='descriptionTextarea') {{$t('templates.dialogs.create.description_textarea.label')}}
            // Область ввода текста краткого описания узла
            textarea.form__input#descriptionTextarea(:placeholder="$t('templates.dialogs.create.description_textarea.label')" v-model.trim="$v.selectedTemplate.description.$model")
          .error(v-if="!$v.selectedTemplate.description.required") {{$t('templates.dialogs.create.description_textarea.required_error')}}
          .error(v-if="!$v.selectedTemplate.description.minLength") {{$t('templates.dialogs.create.description_textarea.at_least_error', {number: $v.selectedTemplate.description.$params.minLength.min})}}
          .error(v-if="!$v.selectedTemplate.description.maxLength") {{$t('templates.dialogs.create.description_textarea.at_most_error', {number: $v.selectedTemplate.description.$params.maxLength.max})}}
          .row
            .col-xs-6(style='margin-bottom: 16px;')
              ul
                li
                  .ui-checkbox-wrapper
                    // Флаг открытия доступа к данным узла для систем сбора информации
                    // о потенциальных клиентах
                    input#accessCheckbox.ui-checkbox(type='checkbox' v-model='selectedTemplate.access')
                    label.label--inline(for='accessCheckbox' v-tooltip="$t('templates.dialogs.create.public.tooltip')") {{$t('templates.dialogs.create.public.label')}}
        // Форма импорта шаблона по его глобальному ИД
        // Подавление стандартной отправки пост-запроса формой
        form(v-if="tempFormMode == 'import'" v-on:submit.prevent='')
          // Привязка блока с полем ввода к свойству модели
          // с указанием текстов ошибок валидации
          .form-item(:class="{ 'form-group--error': $v.importTemplate.id.$error }")
            label.form__label(for='importTemplateIdInput') Id:
            // Поле ввода глобального ИД импортируемого шаблона
            input.form__input#importTemplateIdInput(type='text' :placeholder="$t('templates.dialogs.import.id_input.placeholder')" v-model.trim="$v.importTemplate.id.$model")
          .error(v-if="!$v.importTemplate.id.required") {{$t('templates.dialogs.import.id_input.required_error')}}
      .ui-messageBox__footer
        .button.button-light.ui-messageBox-cancel {{formStaticContent.buttons.cancel}}
        .button.button-primary.ui-messageBox-ok(v-if="tempFormMode == 'create' || tempFormMode == 'edit'") {{formStaticContent.buttons.ok}}
        .button.button-primary.ui-messageBox-ok(v-else-if="tempFormMode == 'import'") {{formStaticContent.buttons.ok}}
      #errorMessage.ui-message.ui-message--danger
        span.message-title {{$t('templates.messages.error')}}
        span(v-if="errorMessage") : {{ errorMessage }}
</template>
<script>
import { showRightSidebar, hideRightSidebar, uiMessage, showMessage } from '@/assets/js/uimini.js'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
// import Experimental from '@/components/Experimental.vue'
import FabricCanvas from '@/components/FabricCanvas.vue'
export default {
  components: {
    // Experimental
    FabricCanvas
  },
  data () {
    return {
      elemsGetter: 'templateElems',
      depsGetter: 'templateDeps',
      actionNames: {
        newNode: 'newTemplateNode',
        editNode: 'editTemplateNode',
        deleteNode: 'deleteTemplateNode',
        newDep: 'newTemplateDep',
        deleteDep: 'deleteTemplateDep'
      },
      selectedTemplate: {
        title: '',
        description: '',
        access: false
      },
      templatesSidebarShown: true,
      tempCreateDialogHandler: null,
      tempEditDialogHandler: null,
      tempDeleteDialogHandler: null,
      tempUseDialogHandler: null,
      tempImportDialogHandler: null,
      tempFormMode: 'create',
      submitStatus: '',
      treeCopyingCompleted: false,
      templateNodesDictionary: null,
      importTemplate: {
        id: null
      }
    }
  },
  // Правила валидации
  validations: {
    selectedTemplate: {
      title: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128)
      },
      description: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(500)
      }
    },
    importTemplate: {
      id: {
        required
      }
    }
  },
  computed: {
    temps () {
      // источник данных о шаблонах
      const templates = this.$store.getters.temps
      console.log('📋 Templates in store:', templates)
      return templates
    },
    currentUserId () {
      const userId = this.$store.getters.user ? this.$store.getters.user.id : null
      console.log('👤 Current user ID:', userId)
      return userId
    },
    currentTemplateId () {
      const templateId = this.$store.getters.currentTemplateId
      console.log('🎯 Current template ID:', templateId)
      return templateId
    },
    checkTemplate () {
      // Проверка: есть ли выделенный шаблон в списке
      return this.currentTemplateId !== null
    },
    formStaticContent () {
      return {
        create: {
          title: this.$t('templates.dialogs.create.title'),
          description: this.$t('templates.dialogs.create.description')
        },
        edit: {
          title: this.$t('templates.dialogs.edit.title'),
          description: this.$t('templates.dialogs.edit.description')
        },
        delete: {
          title: this.$t('templates.dialogs.delete.title'),
          description: this.$t('templates.dialogs.delete.description')
        },
        use: {
          title: this.$t('templates.dialogs.use.title'),
          description: this.$t('templates.dialogs.use.description')
        },
        import: {
          title: this.$t('templates.dialogs.import.title'),
          description: this.$t('templates.dialogs.import.description')
        },
        buttons: {
          ok: this.$t('templates.dialogs.buttons.ok'),
          cancel: this.$t('templates.dialogs.buttons.cancel')
        }
      }
    },
    errorMessage() {
      return this.$store.getters.error
    }
  },
  watch: {
    treeCopyingCompleted (newVal, oldVal) {
      if (newVal === true) {
        this.copyDeps()
      }
    }
  },
  methods: {
    hideRightSidebar () {
      if (this.templatesSidebarShown) {
        hideRightSidebar()
        this.templatesSidebarShown = false
      }
    },
    toggleTemplatesSidebar () {
      if (this.templatesSidebarShown) {
        hideRightSidebar()
        this.templatesSidebarShown = false
      } else {
        showRightSidebar()
        this.templatesSidebarShown = true
      }
    },
    addTempClick () {
      // Вызов очистки формы редактирования данных узла
      this.resetTempForm()
      // this.tempFormMode = 'create'
      this.tempCreateDialogHandler = uiMessage(this.tempCreateDialogItOk, this.tempCreateDialogItCancel, 'templatesModal')
      this.tempCreateDialogHandler.call()
      // console.log('this.tempFormMode = ' + this.tempFormMode)
    },
    editTempClick () {
      this.tempFormMode = 'edit'
      this.tempEditDialogHandler = uiMessage(this.tempEditDialogItOk, this.tempEditDialogItCancel, 'templatesModal')
      this.tempEditDialogHandler.call()
    },
    delTempClick () {
      this.tempFormMode = 'delete'
      this.tempDeleteDialogHandler = uiMessage(this.tempDeleteDialogItOk, this.tempDeleteDialogItCancel, 'templatesModal')
      this.tempDeleteDialogHandler.call()
    },
    importTempClick () {
      this.tempFormMode = 'import'
      this.tempImportDialogHandler = uiMessage(this.tempImportDialogItOk, this.tempImportDialogItCancel, 'templatesModal')
      this.tempImportDialogHandler.call()
    },
    useTempClick () {
      // console.log('useTempClick')
      this.tempFormMode = 'use'
      this.tempUseDialogHandler = uiMessage(this.tempUseDialogItOk, this.tempUseDialogItCancel, 'templatesModal')
      this.tempUseDialogHandler.call()
    },
    tempCreateDialogItOk () {
      if (!this.$v.selectedTemplate.$invalid) {
        // Вызываем в хранилище действие создания шаблона
        const store = this.$store
        store.dispatch('newTemplate', {
          title: this.selectedTemplate.title,
          description: this.selectedTemplate.description,
          access: this.selectedTemplate.access
        })
          .then(() => {
            store.dispatch('loadTemplateNodes')
              .then(() => {
                store.dispatch('loadTemplateDeps')
              })
              .then(() => {
                this.tempCreateDialogHandler = null
                this.toggleTemplatesSidebar()
                showMessage('#doneMessage')
              })
          })
      } else {
        showMessage('#cancelledMessage')
      }
    },
    tempCreateDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      // this.tempCreateDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempEditDialogItOk () {
      // Вызываем в хранилище действие Edit шаблона
      // TODO Отправлять для обновления только изменившиеся значения
      // console.log('tempEditDialogItOk')
      if (!this.$v.selectedTemplate.$invalid) {
        this.$store.dispatch('editTemplate', {
          changes: {
            title: this.selectedTemplate.title,
            description: this.selectedTemplate.description,
            access: this.selectedTemplate.access
          }
        })
          .then(() => {
            this.tempEditDialogHandler = null
            showMessage('#doneMessage')
          })
      } else {
        showMessage('#cancelledMessage')
      }
    },
    tempEditDialogItCancel () {
      // Вызываем в хранилище действие изменения выделенного Template
      this.tempEditDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempDeleteDialogItOk () {
      // Вызываем в хранилище действие удаления выделенного Template
      this.$store.dispatch('deleteTemplate', this.currentTemplateId)
        .then(() => {
          this.tempDeleteDialogHandler = null
          this.$store.dispatch('loadTemplates') // Перезагружаем список
            .then(() => {
              this.$store.dispatch('loadTemplateNodes')
                .then(() => {
                  this.$store.dispatch('loadTemplateDeps')
                })
            })
          showMessage('#doneMessage')
        })
        .catch(error => {
          console.error('❌ Delete failed:', error)
          showMessage('#errorMessage')
        })
    },
    tempDeleteDialogItCancel () {
      // Отменяем действие удаления выделенного Template
      this.tempDeleteDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempUseDialogItOk () {
      // Copy Nodes
      let maxNodeTop = this.$store.getters.elems[0].top
      this.$store.getters.elems.forEach(n => {
        if (n.top > maxNodeTop) {
          maxNodeTop = n.top
        }
      })
      // console.log(maxNodeTop)
      let minTempNodeTop = this.$store.getters.templateElems[0].top
      let minTempNodeLeft = this.$store.getters.templateElems[0].left
      this.$store.getters.templateElems.forEach(n => {
        if (n.top < minTempNodeTop) {
          minTempNodeTop = n.top
        }
        if (n.left < minTempNodeLeft) {
          minTempNodeLeft = n.left
        }
      })
      this.templateNodesDictionary = []
      let treeCopyingCount = 0
      this.$store.getters.templateElems.forEach(n => {
        this.$store.dispatch('newNode', {
          title: n.title,
          type: n.type,
          description: n.description,
          access: n.access,
          status: n.status,
          dependenciesSatisfied: n.dependenciesSatisfied,
          radius: n.radius,
          left: n.left - minTempNodeLeft + 100,
          top: n.top - minTempNodeTop + maxNodeTop + 50
        })
          .then(() => {
            this.submitStatus = 'OK'
            // console.log(n.id, this.$store.getters.lastCreatedElemId)
            this.templateNodesDictionary[n.id] = this.$store.getters.lastCreatedElemId
            treeCopyingCount++
            if (treeCopyingCount === this.$store.getters.templateElems.length) {
              // console.log(this.$store.getters.templateElems.length)
              this.treeCopyingCompleted = true
            }
          })
          .catch(err => {
            this.submitStatus = err.message
            showMessage('#errorMessage')
          })
      })
      // Copy Dependencies
      // const depsArray = []
    },
    tempUseDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      // console.log('tempUseDialogItCancel')
      this.tempUseDialogHandler = null
      showMessage('#cancelledMessage')
    },
    // Import OK
    async tempImportDialogItOk () {
      if (!this.$v.importTemplate.$invalid) {
        try {
          const importId = this.importTemplate.id.trim()
          
          if (!importId.includes('@')) {
            showMessage('#errorMessage')
            this.$store.commit('setError', 'Invalid template ID format. Use: userId@templateId')
            return
          }
          
          const [importUserId, importTemplateId] = importId.split('@')
          
          if (!importUserId || !importTemplateId) {
            showMessage('#errorMessage')
            this.$store.commit('setError', 'Invalid template ID format. Both user ID and template ID are required.')
            return
          }
          
          console.log('🔄 Starting template import:', { importUserId, importTemplateId })
          
          const store = this.$store
          
          // Импортируем шаблон
          const result = await store.dispatch('importTemplate', {
            importUserId,
            importTemplateId
          })
          
          if (result.success) {
            // Перезагружаем список шаблонов
            await store.dispatch('loadTemplates')
            
            // Устанавливаем импортированный шаблон как текущий
            await store.dispatch('setCurrentTemplateId', result.templateId)
            
            // Загружаем узлы и зависимости
            await store.dispatch('loadTemplateNodes')
            await store.dispatch('loadTemplateDeps')
            
            // Обновляем форму
            this.setTempForm()
            
            this.tempImportDialogHandler = null
            this.importTemplate.id = ''
            showMessage('#doneMessage')
          }
          
        } catch (error) {
          console.error('❌ Import failed:', error)
          showMessage('#errorMessage')
          this.$store.commit('setError', error.message)
        }
      } else {
        showMessage('#cancelledMessage')
      }
    },
    // Import Cancel
    tempImportDialogItCancel () {
      // console.log('tempImportDialogItCancel')
      this.tempUseDialogHandler = null
      showMessage('#cancelledMessage')
    },
    // Метод сброса состояния формы создания/редактирования узла
    resetTempForm () {
      this.selectedTemplate = {
        title: '',
        description: '',
        access: false
      }
      this.tempFormMode = 'create'
    },
    // Метод установки выбранного шаблона
    // для дальнейшего редактирования в форме
    setTempForm () {
      if (this.checkTemplate) {
        this.selectedTemplate = this.temps.find(temp => temp.id === this.currentTemplateId)
      }
    },
    async templatesItemClick (id) {
      const store = this.$store
      
      // Если уже выбран этот шаблон, ничего не делаем
      if (this.currentTemplateId === id) {
        console.log('ℹ️ Template already selected:', id)
        return
      }
      
      console.log('🎯 Selecting template:', id)
      
      try {
        // Сначала сбрасываем текущий шаблон
        await store.dispatch('setCurrentTemplateId', null)
        
        // Очищаем текущие данные
        store.commit('loadNodes', { target: 'templateElems', nodes: [] })
        store.commit('loadDeps', { target: 'templateDeps', deps: [] })
        
        // Устанавливаем новый шаблон
        await store.dispatch('setCurrentTemplateId', id)
        this.setTempForm()
        
        // Загружаем данные шаблона с таймаутом
        const loadPromise = Promise.all([
          store.dispatch('loadTemplateNodes'),
          store.dispatch('loadTemplateDeps')
        ])
        
        // Добавляем таймаут для предотвращения бесконечной загрузки
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Template loading timeout')), 10000) // 10 секунд
        })
        
        await Promise.race([loadPromise, timeoutPromise])
        
        // Проверяем, что данные загружены
        const nodes = store.getters.templateElems
        const deps = store.getters.templateDeps
        console.log('📊 Loaded data:', {
          nodesCount: nodes.length,
          depsCount: deps.length
        })
        
      } catch (error) {
        console.error('❌ Error loading template data:', error)
        
        // Сбрасываем состояние при ошибке
        await store.dispatch('setCurrentTemplateId', null)
        store.commit('loadNodes', { target: 'templateElems', nodes: [] })
        store.commit('loadDeps', { target: 'templateDeps', deps: [] })
        
        showMessage('#errorMessage')
        
        // Перезагружаем список шаблонов
        try {
          await store.dispatch('loadTemplates')
        } catch (reloadError) {
          console.error('❌ Error reloading templates:', reloadError)
        }
      }
    },
    copyDeps () {
      this.$store.getters.templateDeps.forEach((d, i, array) => {
        // depsArray.push(d)
        // Отправка в хранилище команды "Создать новую зависимость"
        // console.log(d, d.fromNodeId, this.templateNodesDictionary[d.fromNodeId])
        this.$store.dispatch('newDep', {
          fromNodeId: this.templateNodesDictionary[d.fromNodeId],
          toNodeId: this.templateNodesDictionary[d.toNodeId]
        })
          .then(() => {
            // Если удалось - устанавливается флаг успешно завершенной операции
            this.submitStatus = 'OK'
            if (i === array.length - 1) {
              this.templateNodesDictionary = null
              this.treeCopyingCompleted = false
              showMessage('#doneMessage')
            }
          })
          .catch(err => {
            this.submitStatus = err.message
            showMessage('#errorMessage')
          })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  span.ui-title-4
    display inline !important
  .templates-actions-button
    margin 5px
  .templates-item
    padding-left 10px
    &.selected
      background-color #CCC
      font-weight bold
</style>
