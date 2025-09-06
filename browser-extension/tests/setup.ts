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
  window: dom.window,
  document: dom.document,
  Document: dom.Document,
  DocumentFragment: dom.DocumentFragment,
  HTMLElement: dom.HTMLElement,
  HTMLTextAreaElement: dom.HTMLTextAreaElement,
  HTMLDivElement: dom.HTMLDivElement,
  HTMLMetaElement: dom.HTMLMetaElement,
  Element: dom.Element,
  Node: dom.Node,
  Text: dom.Text,
  location: dom.window.location
})

// Mock querySelector methods properly
const originalQuerySelector = dom.document.querySelector.bind(dom.document)
const originalQuerySelectorAll = dom.document.querySelectorAll.bind(dom.document)

dom.document.querySelector = function(selector) {
  try {
    return originalQuerySelector(selector)
  } catch (e) {
    return null
  }
}

dom.document.querySelectorAll = function(selector) {
  try {
    return originalQuerySelectorAll(selector)
  } catch (e) {
    return []
  }
}
