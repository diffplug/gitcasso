import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "wxt"

export default defineConfig({
  manifest: {
    description:
      "Syntax highlighting and autosave for comments on GitHub (and other markdown-friendly websites).",
    host_permissions: ["https://github.com/*"],
    icons: {
      16: "/icons/icon-16.png",
      48: "/icons/icon-48.png",
      128: "/icons/icon-128.png",
    },
    name: "Gitcasso",
    optional_host_permissions: ["https://*/*", "http://*/*"],
    permissions: ["activeTab", "tabs"],
    version: "0.1.0",
  },
  modules: ["@wxt-dev/webextension-polyfill"],
  srcDir: "src",
  vite: () => ({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  }),
  webExt: {
    disabled: true,
  },
})
