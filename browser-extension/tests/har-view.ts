import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { PAGES } from './har-index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

// Store HAR data
const harCache = new Map<string, any>()

// Create mapping from HAR filename to original URL
const harToUrlMap = Object.fromEntries(
  Object.entries(PAGES).map(([key, url]) => [`${key}.har`, url]),
)

// Extract URL parts for location patching
function getUrlParts(filename: string) {
  const originalUrl = harToUrlMap[filename]
  if (!originalUrl) {
    return null
  }

  try {
    const url = new URL(originalUrl)
    return {
      host: url.host,
      hostname: url.hostname,
      href: originalUrl,
      pathname: url.pathname,
    }
  } catch {
    return null
  }
}

// Check if WXT dev server is running
async function checkDevServer(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/@vite/client', {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Load and cache HAR file
async function loadHar(filename: string) {
  if (harCache.has(filename)) {
    return harCache.get(filename)
  }

  const harPath = path.join(__dirname, 'har', filename)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData = JSON.parse(harContent)
  harCache.set(filename, harData)
  return harData
}

// List available HAR files
app.get('/', async (_req, res) => {
  try {
    const harDir = path.join(__dirname, 'har')
    const files = await fs.readdir(harDir)
    const harFiles = files.filter((file) => file.endsWith('.har'))
    const devServerRunning = await checkDevServer()

    const devServerWarning = !devServerRunning
      ? `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <strong>⚠️ Warning:</strong> WXT dev server is not running on localhost:3000<br>
        <small>Gitcasso-enabled links won't work. Run <code>npm run dev</code> to start the server and <strong>then refresh this page</strong>.</small>
      </div>
    `
      : ''

    const links = harFiles
      .map((file) => {
        const basename = path.basename(file, '.har')
        return `
        <li>
          <div style="margin-bottom: 10px; font-weight: bold; color: #555;">${basename}</div>
          <div style="display: flex; gap: 10px;">
            <a href="/page/${file}" style="flex: 1; text-align: center;">🔍 Clean</a>
            <a href="/page/${file}/gitcasso" style="flex: 1; text-align: center; ${!devServerRunning ? 'opacity: 0.5; pointer-events: none;' : ''}">
              🚀 Gitcasso-enabled
            </a>
          </div>
        </li>
      `
      })
      .join('')

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>HAR Page Viewer</title>
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
    <h1>📄 HAR Page Viewer</h1>
    ${devServerWarning}
    <p>Select a recorded page to view:</p>
    <ul>${links}</ul>
</body>
</html>
    `)
  } catch (error) {
    res.status(500).send('Error listing HAR files')
  }
})

// Serve the main HTML page from HAR
app.get('/page/:filename', async (req, res) => {
  try {
    const filename = req.params.filename
    if (!filename.endsWith('.har')) {
      return res.status(400).send('Invalid file type')
    }

    const harData = await loadHar(filename)

    // Find the main HTML response
    const mainEntry = harData.log.entries.find(
      (entry: any) =>
        entry.request.url.includes('github.com') &&
        entry.response.content.mimeType?.includes('text/html') &&
        entry.response.content.text,
    )

    if (!mainEntry) {
      return res.status(404).send('No HTML content found in HAR file')
    }

    let html = mainEntry.response.content.text

    // Replace external URLs with local asset URLs
    html = html.replace(
      /https:\/\/(github\.com|assets\.github\.com|avatars\.githubusercontent\.com|user-images\.githubusercontent\.com)/g,
      `/asset/${filename.replace('.har', '')}`,
    )

    return res.send(html)
  } catch (error) {
    console.error('Error serving page:', error)
    return res.status(500).send('Error loading page')
  }
})

// Serve the main HTML page from HAR with Gitcasso content script injected
app.get('/page/:filename/gitcasso', async (req, res) => {
  try {
    const filename = req.params.filename
    if (!filename.endsWith('.har')) {
      return res.status(400).send('Invalid file type')
    }

    // Get original URL parts for location patching
    const urlParts = getUrlParts(filename)
    if (!urlParts) {
      return res.status(400).send('Unknown HAR file - not found in har-index.ts')
    }

    const harData = await loadHar(filename)

    // Find the main HTML response
    const mainEntry = harData.log.entries.find(
      (entry: any) =>
        entry.request.url.includes('github.com') &&
        entry.response.content.mimeType?.includes('text/html') &&
        entry.response.content.text,
    )

    if (!mainEntry) {
      return res.status(404).send('No HTML content found in HAR file')
    }

    let html = mainEntry.response.content.text

    // Replace external URLs with local asset URLs
    html = html.replace(
      /https:\/\/(github\.com|assets\.github\.com|avatars\.githubusercontent\.com|user-images\.githubusercontent\.com)/g,
      `/asset/${filename.replace('.har', '')}`,
    )

    // Inject patched content script with location patching
    const contentScriptTag = `
      <script>
        // Patch window.location before loading content script
        console.log('Patching window.location to simulate original URL...');
        
        // Use history.pushState to change the pathname
        window.history.pushState({}, '', '${urlParts.pathname}');
        
        console.log('Location patched:', {
          hostname: window.location.hostname,
          pathname: window.location.pathname,
          href: window.location.href,
          host: window.location.host
        });
        
        // Fetch and patch the content script to remove webextension-polyfill issues
        fetch('http://localhost:3000/.output/chrome-mv3-dev/content-scripts/content.js')
          .then(response => response.text())
          .then(code => {
            console.log('Fetched content script, patching webextension-polyfill...');
            
            // Replace the problematic webextension-polyfill error check
            const patchedCode = code.replace(
              /throw new Error\\("This script should only be loaded in a browser extension\\."/g,
              'console.warn("Webextension-polyfill check bypassed for HAR testing"'
            );
            
            // Mock necessary APIs before executing
            window.chrome = window.chrome || {
              runtime: {
                getURL: (path) => 'chrome-extension://gitcasso-test/' + path,
                onMessage: { addListener: () => {} },
                sendMessage: () => Promise.resolve(),
                id: 'gitcasso-test'
              }
            };
            window.browser = window.chrome;
            
            // Execute the patched script
            const script = document.createElement('script');
            script.textContent = patchedCode;
            document.head.appendChild(script);
            
            console.log('Gitcasso content script loaded with location patching for:', '${urlParts.href}');
          })
          .catch(error => {
            console.error('Failed to load and patch content script:', error);
          });
      </script>
    `

    // Insert script before closing body tag, or at the end if no body tag
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${contentScriptTag}</body>`)
    } else {
      html += contentScriptTag
    }

    return res.send(html)
  } catch (error) {
    console.error('Error serving page:', error)
    return res.status(500).send('Error loading page')
  }
})

// Serve assets from HAR file
app.get('/asset/:harname/*', async (req, res) => {
  try {
    const harname = req.params.harname + '.har'
    const assetPath = (req.params as any)[0] as string

    const harData = await loadHar(harname)

    // Find matching asset in HAR
    const assetEntry = harData.log.entries.find((entry: any) => {
      const url = new URL(entry.request.url)
      return url.pathname === '/' + assetPath || url.pathname.endsWith('/' + assetPath)
    })

    if (!assetEntry) {
      return res.status(404).send('Asset not found')
    }

    const content = assetEntry.response.content
    const mimeType = content.mimeType || 'application/octet-stream'

    res.set('Content-Type', mimeType)

    if (content.encoding === 'base64') {
      return res.send(Buffer.from(content.text, 'base64'))
    } else {
      return res.send(content.text || '')
    }
  } catch (error) {
    console.error('Error serving asset:', error)
    return res.status(404).send('Asset not found')
  }
})

app.listen(PORT, () => {
  console.log(`HAR Page Viewer running at http://localhost:${PORT}`)
  console.log('Click the links to view recorded GitHub pages')
})
