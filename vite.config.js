import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ChordVault',
        short_name: 'ChordVault',
        description: 'Chord charts for worship',
        theme_color: '#0b0b0f',
        background_color: '#0b0b0f',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2}']
      }
    })
  ]
})
