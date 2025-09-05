import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3000

// Store HAR data
const harCache = new Map<string, any>()

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
app.get('/', async (req, res) => {
  try {
    const harDir = path.join(__dirname, 'har')
    const files = await fs.readdir(harDir)
    const harFiles = files.filter(file => file.endsWith('.har'))
    
    const links = harFiles.map(file => {
      const basename = path.basename(file, '.har')
      return `<li><a href="/page/${file}">${basename}</a></li>`
    }).join('')
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>HAR Page Viewer</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
        }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
        a { 
            display: block; 
            padding: 15px 20px; 
            background: #f8f9fa; 
            text-decoration: none; 
            color: #333; 
            border-radius: 6px;
            border: 1px solid #e9ecef;
        }
        a:hover { background: #e9ecef; }
    </style>
</head>
<body>
    <h1>📄 HAR Page Viewer</h1>
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
    const mainEntry = harData.log.entries.find((entry: any) => 
      entry.request.url.includes('github.com') && 
      entry.response.content.mimeType?.includes('text/html') &&
      entry.response.content.text
    )
    
    if (!mainEntry) {
      return res.status(404).send('No HTML content found in HAR file')
    }
    
    let html = mainEntry.response.content.text
    
    // Replace external URLs with local asset URLs
    html = html.replace(
      /https:\/\/(github\.com|assets\.github\.com|avatars\.githubusercontent\.com|user-images\.githubusercontent\.com)/g,
      `/asset/${filename.replace('.har', '')}`
    )
    
    res.send(html)
  } catch (error) {
    console.error('Error serving page:', error)
    res.status(500).send('Error loading page')
  }
})

// Serve assets from HAR file
app.get('/asset/:harname/*', async (req, res) => {
  try {
    const harname = req.params.harname + '.har'
    const assetPath = req.params[0]
    
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
      res.send(Buffer.from(content.text, 'base64'))
    } else {
      res.send(content.text || '')
    }
  } catch (error) {
    console.error('Error serving asset:', error)
    res.status(404).send('Asset not found')
  }
})

app.listen(PORT, () => {
  console.log(`HAR Page Viewer running at http://localhost:${PORT}`)
  console.log('Click the links to view recorded GitHub pages')
})