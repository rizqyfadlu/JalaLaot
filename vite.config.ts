import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        "jalalaot": resolve(root, 'pages/jalalaot/index.html'),
        "marketplace": resolve(root, 'pages/marketplace/index.html'),
        "panel-admin-adat": resolve(root, 'pages/panel-admin-adat/index.html'),
        "pesanan-saya": resolve(root, 'pages/pesanan-saya/index.html'),
        "profil-alamat": resolve(root, 'pages/profil-alamat/index.html'),
        "seller-center": resolve(root, 'pages/seller-center/index.html'),
      },
    },
  },
})
