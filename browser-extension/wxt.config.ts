import { defineConfig } from 'wxt'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  vite: () => ({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  }),
  manifest: {
    description:
      'Syntax highlighting and autosave for comments on GitHub (and other other markdown-friendly websites).',
    host_permissions: ['https://*/*', 'http://*/*'],
    icons: {
      16: '/icons/icon-16.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
    name: 'Gitcasso',
    permissions: ['activeTab', 'tabs'],
    version: '1.0.0',
  },
  modules: ['@wxt-dev/webextension-polyfill'],
  srcDir: 'src',
  webExt: {
    disabled: true,
  },
})
