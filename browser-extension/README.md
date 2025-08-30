# Gitcasso browser extension

## Developer quickstart

### Hotreload development

- `npm install`
- `npm run dev`
- open [`chrome://extensions`](chrome://extensions)
- toggle **Developer mode** (top-right)
- click "Load unpacked" (far left)
  - `browser-extension/.output/chrome-mv3-dev`
  - if you can't find `.output`, it's probably hidden, `command+shift+period` will show it
- click the puzzle icon next to the url bar, then pin the Gitcasso icon

### Testing and quality
- `npm run biome` - runs `biome check` (lint & formatting)
- `npm run biome:fix` - fixes most of what `biome check` finds
- `npm run compile` - typechecking
- `npm run test` - vitest

### Deployment
- `npm run build` - build for mv3 for most browsers
- `npm run build:firefox` - build mv2 specifically for Firefox

## How it works

This is a [WXT](https://wxt.dev/)-based browser extension that

- finds `textarea` components and decorates them with [overtype](https://overtype.dev/) and [shiki](https://github.com/shikijs/shiki). 
- stores unposted comment drafts, and makes them easy to find via the extension popup

### Entry points

- src/entrypoints/content.ts - injected into every webpage
- src/entrypoints/popup - html/css/ts which opens when the extension's button gets clicked
