import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import pug from 'vite-plugin-pug'

export default defineConfig({
  plugins: [
    vue(),
    pug(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Skills Organizer'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm.js'
    },
    dedupe: ['vue']
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: false,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'vuex'],
          fabric: ['fabric']
        }
      }
    }
  },
  publicDir: 'public',
  css: {
    preprocessorOptions: {
      stylus: {
        additionalData: `@import "${resolve(__dirname, 'src/assets/stylus/utils/vars.styl')}"`
      }
    }
  },
  define: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY)
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'vuex',
      '@supabase/supabase-js',
      'fabric',
      'vue-i18n',
      'vuelidate'
    ]
  }
})
