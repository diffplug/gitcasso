import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { PAGES } from './har/_har-index'

// Convert glob pattern to regex
function globToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*') // Replace * with .*
    .replace(/\?/g, '.') // Replace ? with .
  return new RegExp(`^${regexPattern}$`)
}

// Filter pages based on pattern
function filterPages(pattern: string) {
  const regex = globToRegex(pattern)
  return Object.entries(PAGES).filter(([name]) => regex.test(name))
}

const FILTER =
  /^(https?:\/\/(github\.com|assets\.github\.com|avatars\.githubusercontent\.com|user-images\.githubusercontent\.com))/

// Sanitization config
const REDACTIONS: Array<[RegExp, string]> = [
  [/\b(authenticity_token|_octo|user_session)=[^"&;]+/g, '$1=REDACTED'],
  [/"login":"[^"]+"/g, '"login":"oss-test-user"'],
  [/"email":"[^"]+"/g, '"email":"oss-test@example.com"'],
]

async function record(name: string, url: string) {
  console.log('Recording HAR:', name, url)

  const browser = await chromium.launch()
  const context = await browser.newContext({
    recordHar: {
      mode: 'minimal', // smaller; omits cookies etc.
      path: `tests/har/${name}.har`,
      urlFilter: FILTER, // restrict scope to GitHub + assets
    },
    storageState: 'playwright/.auth/gh.json', // local-only; never commit
  })

  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // Allow dynamic assets (sprites/avatars) to settle
  await page.waitForTimeout(800)

  await context.close()
  await browser.close()
}

function stripHeaders(headers?: any[]) {
  if (!Array.isArray(headers)) return
  for (let i = headers.length - 1; i >= 0; i--) {
    const n = String(headers[i]?.name || '').toLowerCase()
    if (n === 'cookie' || n === 'set-cookie' || n === 'authorization') {
      headers.splice(i, 1)
    }
  }
}

async function sanitize(filename: string) {
  console.log('Sanitizing:', filename)

  const p = path.join('tests/har', filename)
  const har = JSON.parse(await fs.readFile(p, 'utf8'))

  for (const e of har.log?.entries ?? []) {
    stripHeaders(e.request?.headers)
    stripHeaders(e.response?.headers)

    // Optional: scrub body text for predictable PII
    const content = e.response?.content
    if (content && typeof content.text === 'string') {
      let t = content.text
      for (const [re, rep] of REDACTIONS) t = t.replace(re, rep)
      content.text = t
    }
  }

  await fs.writeFile(p, JSON.stringify(har, null, 2))
}

;(async () => {
  const pattern = process.argv[2]

  // If no argument provided, show available keys
  if (!pattern) {
    console.log('Available recording targets:')
    for (const [name] of Object.entries(PAGES)) {
      console.log(`  ${name}`)
    }
    console.log('\nUsage: pnpm run har:record <pattern>')
    console.log('Examples:')
    console.log('  pnpm run har:record "*"              # Record all')
    console.log('  pnpm run har:record "github_*"       # Record all github_*')
    console.log('  pnpm run har:record "github_issue"   # Record specific target')
    return
  }

  // Filter pages based on pattern
  const pagesToRecord = filterPages(pattern)

  if (pagesToRecord.length === 0) {
    console.log(`No targets match pattern: ${pattern}`)
    console.log('Available targets:')
    for (const [name] of Object.entries(PAGES)) {
      console.log(`  ${name}`)
    }
    return
  }

  console.log(`Recording ${pagesToRecord.length} target(s) matching "${pattern}":`)
  for (const [name] of pagesToRecord) {
    console.log(`  ${name}`)
  }
  console.log()

  await fs.mkdir('tests/har', { recursive: true })

  // Record filtered HAR files
  for (const [name, url] of pagesToRecord) {
    await record(name, url)
  }

  console.log('Recording complete. Sanitizing...')

  // Sanitize recorded HAR files
  for (const [name] of pagesToRecord) {
    await sanitize(`${name}.har`)
  }

  console.log('Done.')
})()
