class PromiseTracker {
    constructor() {
      this.activePromises = new Map()
      this.warningThreshold = 5000 // 5 секунд
      this.errorThreshold = 15000 // 15 секунд
    }
  
    track(promise, name) {
      const id = Symbol(name)
      const startTime = Date.now()
      
      this.activePromises.set(id, {
        name,
        startTime,
        stack: new Error().stack
      })
  
      // Автоматическое завершение при resolve/reject
      const cleanup = () => {
        this.activePromises.delete(id)
      }
  
      promise.then(cleanup).catch(cleanup)
  
      // Мониторинг зависших промисов
      this.monitorPromise(id)
      
      return promise
    }
  
    monitorPromise(id) {
      const promiseInfo = this.activePromises.get(id)
      if (!promiseInfo) return
  
      const checkPromise = () => {
        if (this.activePromises.has(id)) {
          const duration = Date.now() - promiseInfo.startTime
          
          if (duration > this.errorThreshold) {
            console.error(`🚨 STUCK PROMISE: "${promiseInfo.name}" stuck for ${duration}ms`)
            console.error('Stack:', promiseInfo.stack)
            this.activePromises.delete(id)
          } else if (duration > this.warningThreshold) {
            console.warn(`⚠️ SLOW PROMISE: "${promiseInfo.name}" running for ${duration}ms`)
          } else {
            // Продолжаем мониторинг
            setTimeout(checkPromise, 1000)
          }
        }
      }
  
      setTimeout(checkPromise, this.warningThreshold)
    }
  
    getStuckPromises() {
      const stuck = []
      const now = Date.now()
      
      this.activePromises.forEach((info, id) => {
        const duration = now - info.startTime
        if (duration > this.warningThreshold) {
          stuck.push({ ...info, duration })
        }
      })
      
      return stuck
    }
  }
  
  export const promiseTracker = new PromiseTracker()