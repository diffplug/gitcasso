import '@testing-library/jest-dom/vitest'
import { parseHTML } from 'linkedom'

// Set up linkedom globals for browser-like environment
const dom = parseHTML(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Test</title>
  </head>
  <body></body>
</html>
`)

// Mock global DOM objects
Object.assign(globalThis, {
  Document: dom.Document,
  DocumentFragment: dom.DocumentFragment,
  document: dom.document,
  Element: dom.Element,
  HTMLDivElement: dom.HTMLDivElement,
  HTMLElement: dom.HTMLElement,
  HTMLMetaElement: dom.HTMLMetaElement,
  HTMLTextAreaElement: dom.HTMLTextAreaElement,
  location: dom.window.location,
  Node: dom.Node,
  Text: dom.Text,
  window: dom.window,
})
