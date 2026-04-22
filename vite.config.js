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
        description: 'Dashboard Intelijen Harga & Tren Pasar Agritech — pantau harga komoditas, jual beli hasil tani, dan dapatkan analisis pasar berbasis AI.',
        theme_color: '#064e3b',
        background_color: '#022c22',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        dir: 'ltr',
        lang: 'id',
        categories: ['business', 'food', 'shopping', 'utilities'],
        prefer_related_applications: false,
        icons: [
          {
            src: '/assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/assets/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'TaniCerdas Dashboard — Pantau Harga Komoditas'
          },
          {
            src: '/assets/screenshot-narrow.png',
            sizes: '540x960',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'TaniCerdas Pasar B2B — Jual Beli Hasil Tani'
          }
        ],
        shortcuts: [
          {
            name: 'Pasar B2B',
            short_name: 'Pasar',
            description: 'Buka Pasar B2B untuk jual beli komoditas',
            url: '/?view=marketplace',
            icons: [{ src: '/assets/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Lapor Harga',
            short_name: 'Lapor',
            description: 'Laporkan harga komoditas terbaru',
            url: '/?view=dashboard',
            icons: [{ src: '/assets/icon-192.png', sizes: '192x192' }]
          }
        ],
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        display_override: ['standalone', 'minimal-ui'],
        edge_side_panel: {
          preferred_width: 400
        }
      }
    })
  ],
  build: {
    target: 'es2015'
  }
});
