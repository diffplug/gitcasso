/**
 * HAR Page Viewer Test Server
 *
 * This Express server serves recorded HAR files as live web pages for testing.
 * It provides two viewing modes: 'clean' (original page) and 'gitcasso' (with extension injected).
 *
 * Key components:
 * - Loads HAR files from ./har/ directory based on PAGES index in `./har/_har_index.ts`
 * - Patches URLs in HTML to serve assets locally from HAR data
 * - Handles asset serving by matching HAR entries to requested paths
 *
 * Development notes:
 * - Injects Gitcasso content script in 'gitcasso' mode with location patching
 * - Location patching uses history.pushState to simulate original URLs
 * - Chrome APIs are mocked for extension testing outside browser context
 * - Extension assets served from `./output/chrome-mv3-dev` via `/chrome-mv3-dev` route
 */

import { spawn } from 'node:child_process'
import { error } from 'node:console'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Har } from 'har-format'
import { PAGES } from './har/_har-index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

// Middleware to parse JSON bodies
app.use(express.json())

// Store HAR json
const harCache = new Map<keyof typeof PAGES, Har>()

// Extract URL parts for location patching
function getUrlParts(key: keyof typeof PAGES) {
  const originalUrl = PAGES[key]
  const url = new URL(originalUrl)
  return {
    host: url.host,
    hostname: url.hostname,
    href: originalUrl,
    pathname: url.pathname,
  }
}

// Load and cache HAR file
async function loadHar(key: keyof typeof PAGES): Promise<Har> {
  if (harCache.has(key)) {
    return harCache.get(key)!
  }

  const harPath = path.join(__dirname, 'har', `${key}.har`)
  const harContent = await fs.readFile(harPath, 'utf-8')
  const harData = JSON.parse(harContent)
  harCache.set(key, harData)
  return harData
}

// Add redirect routes for each PAGES URL to handle refreshes
Object.entries(PAGES).forEach(([key, url]) => {
  const urlObj = new URL(url)
  app.get(urlObj.pathname, (_req, res) => {
    res.redirect(`/har/${key}/gitcasso`)
  })
})

// List available HAR files
app.get('/', async (_req, res) => {
  try {
    const harDir = path.join(__dirname, 'har')
    const files = await fs.readdir(harDir)
    const harFiles = files.filter((file) => file.endsWith('.har'))

    const links = harFiles
      .map((file) => {
        const basename = path.basename(file, '.har')
        return `
        <li>
          <div style="margin-bottom: 10px; font-weight: bold; color: #555;">${basename}</div>
          <div style="display: flex; gap: 10px;">
            <a href="/har/${basename}/clean" style="flex: 1; text-align: center;">🔍 Clean</a>
            <a href="/har/${basename}/gitcasso" style="flex: 1; text-align: center;">🚀 Gitcasso</a>
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
    <p>Select a recorded page to view:</p>
    <ul>${links}</ul>
</body>
</html>
    `)
  } catch (_error) {
    res.status(500).send('Error listing HAR files')
  }
})

// Serve the main HTML page from HAR
app.get('/har/:key/:mode(clean|gitcasso)', async (req, res) => {
  try {
    // biome-ignore lint/complexity/useLiteralKeys: type comes from path string
    const key = req.params['key'] as keyof typeof PAGES
    // biome-ignore lint/complexity/useLiteralKeys: type comes from path string
    const mode = req.params['mode'] as 'clean' | 'gitcasso'
    if (!(key in PAGES)) {
      return res.status(400).send('Invalid key - not found in PAGES')
    }

    // Find the main HTML response
    const harData = await loadHar(key)
    const originalUrl = PAGES[key]
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
      html = injectGitcassoScript(key, html)
    }
    return res.send(html)
  } catch (error) {
    console.error('Error serving page:', error)
    return res.status(500).send('Error loading page')
  }
})

// Serve assets from HAR file
app.get('/asset/:key/*', async (req, res) => {
  try {
    const key = req.params.key as keyof typeof PAGES
    if (!(key in PAGES)) {
      return res.status(400).send('Invalid key - not found in PAGES')
    }
    const assetPath = (req.params as any)[0] as string

    const harData = await loadHar(key)

    // Find matching asset in HAR by full URL comparison
    const assetEntry = harData.log.entries.find((entry) => {
      try {
        const url = new URL(entry.request.url)
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

    // Run npx wxt build --mode development
    const buildProcess = spawn('npx', ['wxt', 'build', '--mode', 'development'], {
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
  console.log(`HAR Page Viewer running at http://localhost:${PORT}`)
  console.log('Click the links to view recorded pages')
})

function injectGitcassoScript(key: keyof typeof PAGES, html: string) {
  const urlParts = getUrlParts(key)

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
          fetch('/chrome-mv3-dev/content-scripts/content.js')
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
          
          // Create floating rebuild button
          const rebuildButton = document.createElement('div');
          rebuildButton.id = 'gitcasso-rebuild-btn';
          rebuildButton.innerHTML = '🔄';
          rebuildButton.title = 'Rebuild Extension';
          rebuildButton.style.cssText = \`
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
          \`;
          
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
        </script>
      `
  if (!html.includes('</body>')) {
    throw error('No closing body tag, nowhere to put the content script!')
  }
  return html.replace('</body>', `${contentScriptTag}</body>`)
}
