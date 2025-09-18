/**
 * Corpus Viewer Test Server
 *
 * This Express server serves recorded corpus files (both HAR and HTML) as live web pages for testing.
 * It provides two viewing modes: 'clean' (original page) and 'gitcasso' (with extension injected).
 *
 * Key components:
 * - Loads HAR files from ./corpus/har/ and HTML files from ./corpus/html/ based on CORPUS index in `./_corpus-index.ts`
 * - For HAR: Patches URLs in HTML to serve assets locally from HAR data
 * - For HTML: Serves SingleFile-captured HTML directly (assets already inlined)
 * - Handles asset serving by matching HAR entries to requested paths (HAR corpus only)
 *
 * Development notes:
 * - Injects Gitcasso content script in 'gitcasso' mode with location patching
 * - Location patching uses history.pushState to simulate original URLs
 * - Chrome APIs are mocked for extension testing outside browser context
 * - Extension assets served from `./output/chrome-mv3-dev` via `/chrome-mv3-dev` route
 * - Floating rebuild button in gitcasso mode triggers `pnpm run build:dev` and then refresh
 * - CommentSpot monitoring panel displays enhanced textareas with spot data and element info
 * - Real-time updates every 2 seconds to track textarea enhancement detection and debugging
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Har } from 'har-format'
import { CORPUS } from './corpus/_corpus-index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

// Constants
const WEBEXTENSION_POLYFILL_PATCH =
  'throw new Error("This script should only be loaded in a browser extension.")'
const WEBEXTENSION_POLYFILL_REPLACEMENT =
  'console.warn("Webextension-polyfill check bypassed for corpus testing")'
const BROWSER_API_MOCKS =
  'window.chrome=window.chrome||{runtime:{getURL:path=>"chrome-extension://gitcasso-test/"+path,onMessage:{addListener:()=>{}},sendMessage:()=>Promise.resolve(),id:"gitcasso-test"}};window.browser=window.chrome;'
const PERMISSIVE_CSP = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:;"

// UI Styles
const REBUILD_BUTTON_STYLES = `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #007acc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 999999;
  user-select: none;
  transition: all 0.2s ease;
  font-family: system-ui, -apple-system, sans-serif;
`

const COMMENT_SPOT_STYLES = {
  container:
    'position: fixed; top: 80px; right: 20px; width: 400px; max-height: 400px; background: rgba(255, 255, 255, 0.95); border: 1px solid #ddd; border-radius: 8px; padding: 15px; font-family: Monaco, Menlo, Ubuntu Mono, monospace; font-size: 11px; line-height: 1.4; overflow-y: auto; z-index: 999998; box-shadow: 0 4px 12px rgba(0,0,0,0.2); backdrop-filter: blur(10px);',
  empty: 'color: #666; font-style: italic;',
  header: 'font-weight: bold; margin-bottom: 8px; color: #333;',
  jsonPre: 'margin: 4px 0; font-size: 10px;',
  noInfo: 'color: #999; font-style: italic; margin-top: 4px;',
  spotContainer: 'margin-bottom: 12px; padding: 8px; border: 1px solid #eee; border-radius: 4px;',
  spotTitle: 'font-weight: bold; color: #555;',
  textareaHeader: 'font-weight: bold; color: #007acc; margin-top: 8px;',
  textareaPre: 'margin: 4px 0; font-size: 10px; color: #666;',
}

// Middleware to parse JSON bodies
app.use(express.json())

// Store HAR json
const harCache = new Map<string, Har>()

// Extract URL parts for location patching
function getUrlParts(key: string) {
  const entry = CORPUS[key]
  if (!entry) {
    throw new Error(`Corpus entry not found: ${key}`)
  }
  const originalUrl = entry.url
  const url = new URL(originalUrl)
  return {
    host: url.host,
    hostname: url.hostname,
    href: originalUrl,
    pathname: url.pathname,
  }
}

// Load and cache HAR file
async function loadHar(key: string): Promise<Har> {
  if (harCache.has(key)) {
    return harCache.get(key)!
  }

  const harPath = path.join(__dirname, 'corpus', `${key}.har`)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData = JSON.parse(harContent)
  harCache.set(key, harData)
  return harData
}

// Add redirect routes for each CORPUS URL to handle refreshes
Object.entries(CORPUS).forEach(([key, entry]) => {
  const urlObj = new URL(entry.url)
  app.get(urlObj.pathname, (_req, res) => {
    res.redirect(`/corpus/${key}/gitcasso`)
  })
})

// List available corpus files
app.get('/', async (_req, res) => {
  try {
    const links = Object.entries(CORPUS)
      .map(([key, entry]) => {
        const description = entry.description
          ? `<div style="color: #666; font-size: 0.9em; margin-top: 5px;">${entry.description}</div>`
          : ''
        return `
        <li>
          <div style="margin-bottom: 10px;">
            <div style="font-weight: bold; color: #555;">${key}</div>
            <div style="font-size: 0.9em; color: #888;">${entry.type.toUpperCase()}</div>
            ${description}
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="/corpus/${key}/clean" style="flex: 1; text-align: center;">🔍 Clean</a>
            <a href="/corpus/${key}/gitcasso" style="flex: 1; text-align: center;">🚀 Gitcasso</a>
          </div>
        </li>
      `
      })
      .join('')

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Corpus Viewer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
        }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
        a {
            display: block;
            padding: 12px 20px;
            background: #fff;
            text-decoration: none;
            color: #333;
            border-radius: 6px;
            border: 1px solid #dee2e6;
            transition: all 0.2s;
        }
        a:hover:not([style*="pointer-events: none"]) { background: #e9ecef; transform: translateY(-1px); }
        code { background: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>📄 Corpus Viewer</h1>
    <p>Select a recorded page to view:</p>
    <ul>${links}</ul>
    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007acc;">
        <h3>Corpus Types</h3>
        <p><strong>HAR:</strong> Automated network captures of initial page loads</p>
        <p><strong>HTML:</strong> Manual SingleFile captures of post-interaction states</p>
    </div>
</body>
</html>
    `)
  } catch (_error) {
    res.status(500).send('Error listing corpus files')
  }
})

// Serve the main page from corpus
app.get('/corpus/:key/:mode(clean|gitcasso)', async (req, res) => {
  try {
    // biome-ignore lint/complexity/useLiteralKeys: type comes from path string
    const key = req.params['key']
    // biome-ignore lint/complexity/useLiteralKeys: type comes from path string
    const mode = req.params['mode'] as 'clean' | 'gitcasso'

    if (!key || !(key in CORPUS)) {
      return res.status(400).send('Invalid key - not found in CORPUS')
    }

    const entry = CORPUS[key]!

    if (entry.type === 'har') {
      // Handle HAR corpus
      const harData = await loadHar(key)
      const originalUrl = entry.url
      const mainEntry =
        harData.log.entries.find(
          (entry) =>
            entry.request.url === originalUrl &&
            entry.response.content.mimeType?.includes('text/html') &&
            entry.response.content.text,
        ) ||
        harData.log.entries.find(
          (entry) =>
            entry.response.status === 200 &&
            entry.response.content.mimeType?.includes('text/html') &&
            entry.response.content.text,
        )
      if (!mainEntry) {
        return res.status(404).send('No HTML content found in HAR file')
      }

      // Extract all domains from HAR entries for dynamic replacement
      const domains = new Set<string>()
      harData.log.entries.forEach((entry) => {
        try {
          const url = new URL(entry.request.url)
          domains.add(url.hostname)
        } catch {
          // Skip invalid URLs
        }
      })

      // Replace external URLs with local asset URLs
      let html = mainEntry.response.content.text!
      domains.forEach((domain) => {
        const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`https?://${escapedDomain}`, 'g')
        html = html.replace(regex, `/asset/${key}`)
      })
      if (mode === 'gitcasso') {
        html = injectGitcassoScriptForHAR(key, html)
      }
      return res.send(html)
    } else if (entry.type === 'html') {
      // Handle HTML corpus
      const htmlPath = path.join(__dirname, 'corpus', `${key}.html`)
      let html = await fs.readFile(htmlPath, 'utf-8')

      // Strip CSP headers that might block our injected scripts
      html = stripCSPFromHTML(html)

      if (mode === 'gitcasso') {
        html = await injectGitcassoScriptForHTML(key, html)
      }

      // Set permissive headers for HTML corpus
      res.set({
        'Content-Security-Policy': PERMISSIVE_CSP,
        'X-Content-Type-Options': 'nosniff',
      })

      return res.send(html)
    } else {
      return res.status(400).send('Unknown corpus type')
    }
  } catch (error) {
    console.error('Error serving page:', error)
    return res.status(500).send('Error loading page')
  }
})

// Serve assets from HAR file (only for HAR corpus)
app.get('/asset/:key/*', async (req, res) => {
  try {
    const key = req.params.key
    if (!key || !(key in CORPUS)) {
      return res.status(400).send('Invalid key - not found in CORPUS')
    }

    const entry = CORPUS[key]!
    if (entry.type !== 'har') {
      return res.status(400).send('Asset serving only available for HAR corpus')
    }

    const assetPath = (req.params as any)[0] as string

    const harData = await loadHar(key)

    // Find matching asset in HAR by full URL comparison
    const assetEntry = harData.log.entries.find((entry) => {
      try {
        const url = new URL(entry.request.url)
        return matchAssetPath(url, assetPath)
      } catch {
        return false
      }
    })

    if (!assetEntry) {
      return res.status(404).send('Asset not found')
    }

    const content = assetEntry.response.content
    const mimeType = content.mimeType || 'application/octet-stream'
    res.set('Content-Type', mimeType)
    if (content.encoding === 'base64') {
      return res.send(Buffer.from(content.text!, 'base64'))
    } else {
      return res.send(content.text!)
    }
  } catch (error) {
    console.error('Error serving asset:', error)
    return res.status(404).send('Asset not found')
  }
})

// Serve extension assets from filesystem
app.use('/chrome-mv3-dev', express.static(path.join(__dirname, '..', '.output', 'chrome-mv3-dev')))

// Rebuild endpoint
app.post('/rebuild', async (_req, res) => {
  try {
    console.log('Rebuild triggered via API')

    // Run pnpm run build:dev
    const buildProcess = spawn('pnpm', ['run', 'build:dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    buildProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      console.log('[BUILD]', data.toString().trim())
    })

    buildProcess.stderr.on('data', (data) => {
      stderr += data.toString()
      console.error('[BUILD ERROR]', data.toString().trim())
    })

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Build completed successfully')
        res.json({ message: 'Build completed successfully', success: true })
      } else {
        console.error('Build failed with code:', code)
        res.status(500).json({
          error: stderr || stdout,
          message: 'Build failed',
          success: false,
        })
      }
    })

    buildProcess.on('error', (error) => {
      console.error('Failed to start build process:', error)
      res.status(500).json({
        error: error.message,
        message: 'Failed to start build process',
        success: false,
      })
    })
  } catch (error) {
    console.error('Rebuild endpoint error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Internal server error',
      success: false,
    })
  }
})

app.listen(PORT, () => {
  console.log(`Corpus Viewer running at http://localhost:${PORT}`)
  console.log('Click the links to view recorded pages')
})

// Strip CSP meta tags and headers from HTML that might block our scripts
function stripCSPFromHTML(html: string): string {
  // Remove CSP meta tags
  html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']content-security-policy["'][^>]*>/gi, '')
  html = html.replace(/<meta[^>]*name\s*=\s*["']content-security-policy["'][^>]*>/gi, '')

  // Remove any other restrictive security meta tags
  html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']x-content-type-options["'][^>]*>/gi, '')

  return html
}

// Shared UI Component Functions
function createRebuildButtonScript(): string {
  return `
    // Create floating rebuild button
    const rebuildButton = document.createElement('div');
    rebuildButton.id = 'gitcasso-rebuild-btn';
    rebuildButton.innerHTML = '🔄';
    rebuildButton.title = 'Rebuild Extension';
    rebuildButton.style.cssText = \`${REBUILD_BUTTON_STYLES}\`;

    rebuildButton.addEventListener('mouseenter', () => {
      rebuildButton.style.transform = 'scale(1.1)';
      rebuildButton.style.backgroundColor = '#005a9e';
    });

    rebuildButton.addEventListener('mouseleave', () => {
      rebuildButton.style.transform = 'scale(1)';
      rebuildButton.style.backgroundColor = '#007acc';
    });

    rebuildButton.addEventListener('click', async () => {
      try {
        rebuildButton.innerHTML = '⏳';
        rebuildButton.style.backgroundColor = '#ffa500';
        rebuildButton.title = 'Rebuilding...';

        const response = await fetch('/rebuild', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
          rebuildButton.innerHTML = '✅';
          rebuildButton.style.backgroundColor = '#28a745';
          rebuildButton.title = 'Build successful! Reloading...';

          setTimeout(() => {
            location.reload(true);
          }, 1000);
        } else {
          rebuildButton.innerHTML = '❌';
          rebuildButton.style.backgroundColor = '#dc3545';
          rebuildButton.title = 'Build failed: ' + (result.error || result.message);

          setTimeout(() => {
            rebuildButton.innerHTML = '🔄';
            rebuildButton.style.backgroundColor = '#007acc';
            rebuildButton.title = 'Rebuild Extension';
          }, 3000);
        }
      } catch (error) {
        console.error('Rebuild failed:', error);
        rebuildButton.innerHTML = '❌';
        rebuildButton.style.backgroundColor = '#dc3545';
        rebuildButton.title = 'Network error: ' + error.message;

        setTimeout(() => {
          rebuildButton.innerHTML = '🔄';
          rebuildButton.style.backgroundColor = '#007acc';
          rebuildButton.title = 'Rebuild Extension';
        }, 3000);
      }
    });

    document.body.appendChild(rebuildButton);
  `
}

function createCommentSpotDisplayScript(urlParts: ReturnType<typeof getUrlParts>): string {
  return `
    // Create CommentSpot display
    const commentSpotDisplay = document.createElement('div');
    commentSpotDisplay.id = 'gitcasso-comment-spots';
    commentSpotDisplay.style.cssText = '${COMMENT_SPOT_STYLES.container}';

    // Simplified display formatting
    const styles = ${JSON.stringify(COMMENT_SPOT_STYLES)};

    function updateCommentSpotDisplay() {
      const textareas = document.querySelectorAll('textarea');
      const allTextAreas = [];

      for (const textarea of textareas) {
        const forValue = "id='" + textarea.id + "' name='" + textarea.name + "' className='" + textarea.className + "'";
        const enhancedItem = window.gitcassoTextareaRegistry ? window.gitcassoTextareaRegistry.get(textarea) : undefined;
        if (enhancedItem) {
          allTextAreas.push({
            textarea: forValue,
            spot: enhancedItem.spot,
          });
        } else {
          allTextAreas.push({
            textarea: forValue,
            spot: 'NO_SPOT',
          });
        }
      }
      const harness = {
        url: '${urlParts.href}',
        allTextAreas: allTextAreas
      }
      commentSpotDisplay.innerHTML = '<div style="' + styles.header + '"><pre>' + JSON.stringify(harness, null, 1) + '</pre></div>';
    }

    // Initial update
    updateCommentSpotDisplay()
    setTimeout(updateCommentSpotDisplay, 100);
    setTimeout(updateCommentSpotDisplay, 200);
    setTimeout(updateCommentSpotDisplay, 400);
    setTimeout(updateCommentSpotDisplay, 800);

    document.body.appendChild(commentSpotDisplay);
  `
}

// Asset matching helper
function matchAssetPath(url: URL, assetPath: string): boolean {
  // First try exact path match
  if (url.pathname === `/${assetPath}`) {
    return true
  }
  // Then try path ending match (for nested paths)
  if (url.pathname.endsWith(`/${assetPath}`)) {
    return true
  }
  // Handle query parameters - check if path without query matches
  const pathWithoutQuery = url.pathname + url.search
  if (pathWithoutQuery === `/${assetPath}` || pathWithoutQuery.endsWith(`/${assetPath}`)) {
    return true
  }
  return false
}

// Unified script injection with different content script loading strategies
function createGitcassoScript(
  urlParts: ReturnType<typeof getUrlParts>,
  contentScriptCode?: string,
): string {
  const contentScriptSetup = contentScriptCode
    ? // Direct embedding (for HTML corpus)
      `
      // Set up mocked location
      window.gitcassoMockLocation = {
        host: '${urlParts.host}',
        pathname: '${urlParts.pathname}'
      };

      // Set up browser API mocks
      window.chrome = window.chrome || {
        runtime: {
          getURL: path => "chrome-extension://gitcasso-test/" + path,
          onMessage: { addListener: () => {} },
          sendMessage: () => Promise.resolve(),
          id: "gitcasso-test"
        }
      };
      window.browser = window.chrome;

      // Execute the patched content script directly
      try {
        ${contentScriptCode}
        console.log('Gitcasso content script loaded with location patching for:', '${urlParts.href}');
      } catch (error) {
        console.error('Failed to execute content script:', error);
      }
      `
    : // Fetch-based loading (for HAR corpus)
      `
      // Fetch and patch the content script to remove webextension-polyfill issues
      fetch('/chrome-mv3-dev/content-scripts/content.js')
        .then(response => response.text())
        .then(code => {
          console.log('Fetched content script, patching webextension-polyfill and detectLocation...');

          // Replace the problematic webextension-polyfill error check
          let patchedCode = code.replace(
            '${WEBEXTENSION_POLYFILL_PATCH}',
            '${WEBEXTENSION_POLYFILL_REPLACEMENT}'
          );
          window.gitcassoMockLocation = {
            host: '${urlParts.host}',
            pathname: '${urlParts.pathname}'
          };

          // Execute the patched script with browser API mocks prepended
          const script = document.createElement('script');
          script.textContent = '${BROWSER_API_MOCKS}' + patchedCode;
          document.head.appendChild(script);
          console.log('Gitcasso content script loaded with location patching for:', '${urlParts.href}');
        })
        .catch(error => {
          console.error('Failed to load and patch content script:', error);
        });
      `

  return `
    <script>
      console.log('Loading Gitcasso with mocked location:', '${urlParts.href}');
      ${contentScriptSetup}
      ${createRebuildButtonScript()}
      ${createCommentSpotDisplayScript(urlParts)}
    </script>
  `
}

// HAR version - uses fetch() to load content script (original approach)
function injectGitcassoScriptForHAR(key: string, html: string): string {
  const urlParts = getUrlParts(key)
  const contentScriptTag = createGitcassoScript(urlParts)

  if (html.includes('</body>')) {
    return html.replace('</body>', `${contentScriptTag}</body>`)
  } else {
    return html + contentScriptTag
  }
}

// HTML version - embeds content script directly to avoid CSP issues
async function injectGitcassoScriptForHTML(key: string, html: string): Promise<string> {
  const urlParts = getUrlParts(key)

  // Read and embed the content script directly to avoid CSP issues
  let contentScriptCode = ''
  try {
    const contentScriptPath = path.join(
      __dirname,
      '..',
      '.output',
      'chrome-mv3-dev',
      'content-scripts',
      'content.js',
    )
    contentScriptCode = await fs.readFile(contentScriptPath, 'utf-8')

    // Patch the content script to remove webextension-polyfill issues
    contentScriptCode = contentScriptCode.replace(
      WEBEXTENSION_POLYFILL_PATCH,
      WEBEXTENSION_POLYFILL_REPLACEMENT,
    )
  } catch (error) {
    console.warn('Could not read content script, using fallback:', error)
    contentScriptCode = 'console.warn("Content script not found - extension may not be built");'
  }

  const contentScriptTag = createGitcassoScript(urlParts, contentScriptCode)

  if (html.includes('</body>')) {
    return html.replace('</body>', `${contentScriptTag}</body>`)
  } else {
    return html + contentScriptTag
  }
}
