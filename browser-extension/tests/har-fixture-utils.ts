import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Har as HarFile } from 'har-format'
import { parseHTML } from 'linkedom'
import { CORPUS } from './corpus/_corpus-index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface TestDOMGlobals {
  Document: typeof Document
  DocumentFragment: typeof DocumentFragment
  document: Document
  Element: typeof Element
  HTMLDivElement: typeof HTMLDivElement
  HTMLElement: typeof HTMLElement
  HTMLMetaElement: typeof HTMLMetaElement
  HTMLTextAreaElement: typeof HTMLTextAreaElement
  location: Location
  Node: typeof Node
  Text: typeof Text
  window: Window
}

export interface TestDOMContext {
  cleanup: () => void
  document: Document
  window: Window
  url: string
}

let currentDOMInstance: any = null
let originalGlobals: Partial<TestDOMGlobals> = {}

export async function loadHtmlFromHar(key: keyof typeof CORPUS): Promise<string> {
  const entry = CORPUS[key]
  if (!entry || entry.type !== 'har') {
    throw new Error(`Invalid HAR corpus key: ${String(key)}`)
  }
  const url = entry.url
  const harPath = path.join(__dirname, 'corpus', 'har', `${String(key)}.har`)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData: HarFile = JSON.parse(harContent)
  const mainEntry = harData.log.entries.find((entry) => entry.request.url === url)

  if (!mainEntry) {
    throw new Error(`No entry found for URL: ${url} in HAR file: ${harPath}`)
  }

  return mainEntry.response.content.text || ''
}

export function createDOMFromHar(html: string, url: string): TestDOMGlobals {
  const dom = parseHTML(html)

  return {
    Document: dom.Document,
    DocumentFragment: dom.DocumentFragment,
    document: dom.document,
    Element: dom.Element,
    HTMLDivElement: dom.HTMLDivElement,
    HTMLElement: dom.HTMLElement,
    HTMLMetaElement: dom.HTMLMetaElement,
    HTMLTextAreaElement: dom.HTMLTextAreaElement,
    location: new URL(url) as any,
    Node: dom.Node,
    Text: dom.Text,
    window: {
      ...dom.window,
      location: new URL(url),
    } as any,
  }
}

export function setupDOMFromHar(domGlobals: TestDOMGlobals): void {
  // Store original globals for cleanup
  originalGlobals = {
    Document: (globalThis as any).Document,
    DocumentFragment: (globalThis as any).DocumentFragment,
    document: (globalThis as any).document,
    Element: (globalThis as any).Element,
    HTMLDivElement: (globalThis as any).HTMLDivElement,
    HTMLElement: (globalThis as any).HTMLElement,
    HTMLMetaElement: (globalThis as any).HTMLMetaElement,
    HTMLTextAreaElement: (globalThis as any).HTMLTextAreaElement,
    location: (globalThis as any).location,
    Node: (globalThis as any).Node,
    Text: (globalThis as any).Text,
    window: (globalThis as any).window,
  }

  // Set new globals
  Object.assign(globalThis, domGlobals)
  currentDOMInstance = domGlobals
}

export function cleanupDOM(): void {
  if (currentDOMInstance) {
    // Reset globals to original values
    Object.assign(globalThis, originalGlobals)

    // Clear references
    currentDOMInstance = null
    originalGlobals = {}
  }
}

export async function setupHarDOM(key: keyof typeof CORPUS): Promise<TestDOMGlobals> {
  const html = await loadHtmlFromHar(key)
  const entry = CORPUS[key]
  if (!entry || entry.type !== 'har') {
    throw new Error(`Invalid HAR corpus key: ${String(key)}`)
  }
  const url = entry.url
  const domGlobals = createDOMFromHar(html, url)
  setupDOMFromHar(domGlobals)
  return domGlobals
}
