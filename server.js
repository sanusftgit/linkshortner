import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const URLS_FILE = path.join(__dirname, 'urls.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Generate random short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Load URLs from JSON file
async function loadUrls() {
  try {
    const data = await fs.readFile(URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save URLs to JSON file
async function saveUrls(urls) {
  await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// API endpoint to shorten URL
app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Please enter a valid URL (must include http:// or https://)' });
    }
    
    const urls = await loadUrls();
    
    // Check if URL already exists
    for (const [code, storedUrl] of Object.entries(urls)) {
      if (storedUrl === url) {
        return res.json({ 
          shortUrl: `https://sanu.lkdevs.com/r/${code}`,
          shortCode: code 
        });
      }
    }
    
    // Generate new short code
    let shortCode;
    do {
      shortCode = generateShortCode();
    } while (urls[shortCode]);
    
    urls[shortCode] = url;
    await saveUrls(urls);
    
    res.json({ 
      shortUrl: `https://sanu.lkdevs.com/r/${shortCode}`,
      shortCode 
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect endpoint
app.get('/r/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const urls = await loadUrls();
    
    if (urls[code]) {
      res.redirect(urls[code]);
    } else {
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-light">
          <div class="container mt-5">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body text-center">
                    <h1 class="card-title text-danger">404</h1>
                    <p class="card-text">Short URL not found</p>
                    <a href="/" class="btn btn-primary">Go Home</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// API endpoint to get all URLs (for admin/debugging)
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await loadUrls();
    const urlList = Object.entries(urls).map(([code, url]) => ({
      code,
      url,
      shortUrl: `https://sanu.lkdevs.com/r/${code}`
    }));
    res.json(urlList);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Link shortener server running on https://sanu.lkdevs.com/:${PORT}`);
});