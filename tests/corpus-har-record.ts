import fs from "node:fs/promises"
import path from "node:path"
import { chromium } from "@playwright/test"
import { CORPUS } from "./corpus/_corpus-index"

// Convert glob pattern to regex
function globToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape regex special chars
    .replace(/\*/g, ".*") // Replace * with .*
    .replace(/\?/g, ".") // Replace ? with .
  return new RegExp(`^${regexPattern}$`)
}

// Filter HAR corpus entries based on pattern
function filterHarEntries(pattern: string) {
  const regex = globToRegex(pattern)
  return Object.entries(CORPUS)
    .filter(([name, entry]) => regex.test(name) && entry.type === "har")
    .map(([name, entry]) => [name, entry.url] as const)
}

const FILTER =
  /^(https?:\/\/(github\.com|assets\.github\.com|avatars\.githubusercontent\.com|user-images\.githubusercontent\.com))/

// Sanitization config
const REDACTIONS: Array<[RegExp, string]> = [
  [/\b(authenticity_token|_octo|user_session)=[^"&;]+/g, "$1=REDACTED"],
  [/"login":"[^"]+"/g, '"login":"oss-test-user"'],
  [/"email":"[^"]+"/g, '"email":"oss-test@example.com"'],
]

async function record(name: string, url: string) {
  console.log("Recording HAR:", name, url)

  const browser = await chromium.launch()
  const context = await browser.newContext({
    recordHar: {
      mode: "minimal", // smaller; omits cookies etc.
      path: `tests/corpus/har/${name}.har`,
      urlFilter: FILTER, // restrict scope to GitHub + assets
    },
    storageState: "playwright/.auth/gh.json", // local-only; never commit
  })

  const page = await context.newPage()
  await page.goto(url, { waitUntil: "domcontentloaded" })
  // Allow dynamic assets (sprites/avatars) to settle
  await page.waitForTimeout(800)

  await context.close()
  await browser.close()
}

function stripHeaders(headers?: any[]) {
  if (!Array.isArray(headers)) return
  for (let i = headers.length - 1; i >= 0; i--) {
    const n = String(headers[i]?.name || "").toLowerCase()
    if (n === "cookie" || n === "set-cookie" || n === "authorization") {
      headers.splice(i, 1)
    }
  }
}

async function sanitize(filename: string) {
  console.log("Sanitizing:", filename)

  const p = path.join("tests/corpus", filename)
  const har = JSON.parse(await fs.readFile(p, "utf8"))

  for (const e of har.log?.entries ?? []) {
    stripHeaders(e.request?.headers)
    stripHeaders(e.response?.headers)

    // Optional: scrub body text for predictable PII
    const content = e.response?.content
    if (content && typeof content.text === "string") {
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
    console.log("Available HAR recording targets:")
    for (const [name, entry] of Object.entries(CORPUS)) {
      if (entry.type === "har") {
        console.log(`  ${name}`)
      }
    }
    console.log("\nUsage: pnpm run corpus:record:har <pattern>")
    console.log("Examples:")
    console.log(
      '  pnpm run corpus:record:har "*"              # Record all HAR targets'
    )
    console.log(
      '  pnpm run corpus:record:har "gh_*"           # Record all gh_* targets'
    )
    console.log(
      '  pnpm run corpus:record:har "gh_issue"       # Record specific target'
    )
    return
  }

  // Filter HAR entries based on pattern
  const entriesToRecord = filterHarEntries(pattern)

  if (entriesToRecord.length === 0) {
    console.log(`No HAR targets match pattern: ${pattern}`)
    console.log("Available HAR targets:")
    for (const [name, entry] of Object.entries(CORPUS)) {
      if (entry.type === "har") {
        console.log(`  ${name}`)
      }
    }
    return
  }

  console.log(
    `Recording ${entriesToRecord.length} HAR target(s) matching "${pattern}":`
  )
  for (const [name] of entriesToRecord) {
    console.log(`  ${name}`)
  }
  console.log()

  await fs.mkdir("tests/corpus/har", { recursive: true })

  // Record filtered HAR files
  for (const [name, url] of entriesToRecord) {
    await record(name, url)
  }

  console.log("Recording complete. Sanitizing...")

  // Sanitize recorded HAR files
  for (const [name] of entriesToRecord) {
    await sanitize(`${name}.har`)
  }

  console.log("Done.")
})()
