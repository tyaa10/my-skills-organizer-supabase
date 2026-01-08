import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    // Увеличиваем время жизни сессии
    persistSession: true,
    autoRefreshToken: true,
    // Настройки для долгой сессии
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 365 * 24 * 60 * 60, // 1 год в секундах
      domain: '.vercel.app',
      path: '/',
      sameSite: 'lax',
      secure: true
    }
  },
  global: {
    headers: { 'x-application-name': 'skills-organizr' }
  }
})