import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        id: '/',
        name: 'TaniCerdas AI',
        short_name: 'TaniCerdas',
        description: 'Dashboard Intelijen Harga & Tren Pasar Agritech',
        theme_color: '#064e3b',
        background_color: '#022c22',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/assets/icon-192.png',
            sizes: '1024x1024',
            type: 'image/jpeg'
          },
          {
            src: '/assets/icon-512.png',
            sizes: '1024x1024',
            type: 'image/jpeg'
          },
          {
            src: '/assets/icon-512.png',
            sizes: '1024x1024',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/assets/icon-512.png',
            sizes: '1024x1024',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'TaniCerdas Dashboard'
          },
          {
            src: '/assets/icon-512.png',
            sizes: '1024x1024',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'TaniCerdas Mobile'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015'
  }
});
