<template lang="pug">
.auth-callback
  .loading-container
    .spinner
    p Обработка аутентификации...
</template>

<script>
import { supabase } from '@/helpers/supabaseConfig'

export default {
  name: 'AuthCallback',
  async mounted() {
    try {
      // Ждем завершения OAuth flow
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('OAuth error:', error)
        this.$router.push('/signin?error=' + encodeURIComponent(error.message))
      } else {
        // Редирект на главную через 1 секунду
        setTimeout(() => {
          this.$router.push('/')
        }, 1000)
      }
    } catch (err) {
      console.error('Callback error:', err)
      this.$router.push('/signin')
    }
  }
}
</script>

<style lang="stylus" scoped>
.auth-callback
  display flex
  justify-content center
  align-items center
  min-height 100vh
  background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  
  .loading-container
    text-align center
    color white
    
    .spinner
      width 50px
      height 50px
      border 5px solid rgba(255, 255, 255, 0.3)
      border-radius 50%
      border-top-color white
      animation spin 1s ease-in-out infinite
      margin 0 auto 20px
    
    p
      font-size 1.2rem

@keyframes spin
  to
    transform rotate(360deg)
</style>