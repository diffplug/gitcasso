import { defineConfig } from 'wxt'

export default defineConfig({
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
    permissions: ['activeTab'],
    version: '1.0.0',
  },
  modules: ['@wxt-dev/webextension-polyfill'],
  srcDir: 'src',
  webExt: {
    disabled: true,
  },
})
