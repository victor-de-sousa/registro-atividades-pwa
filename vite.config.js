import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest', // 
      srcDir: 'src',                // 
      filename: 'sw.js',            // 

      manifest: {
        name: 'Gerenciador de Tarefas',
        short_name: 'Tarefas',
        description: 'Aplicativo PWA para gerenciar tarefas diárias',
        theme_color: '#4a90d9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        id: 'com.task-manager.app',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module', // 
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})