const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const WEB_ROOT = __dirname;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Set CORS headers to allow all origins (required for Replit proxy)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  // Default to index.html for root requests
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Secure path resolution to prevent directory traversal
  const safePath = path.resolve(WEB_ROOT, '.' + pathname);
  
  // Security check: ensure the resolved path is within the web root
  if (!safePath.startsWith(WEB_ROOT + path.sep) && safePath !== WEB_ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>');
    return;
  }

  const filePath = safePath;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
      }
    } else {
      // Set cache headers based on content type
      if (ext === '.html') {
        // HTML should not be cached to ensure updates are visible
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (['.js', '.css', '.json'].includes(ext)) {
        // JS/CSS/JSON - short cache in dev, longer in production
        const isProduction = process.env.NODE_ENV === 'production';
        const maxAge = isProduction ? 3600 : 300; // 1 hour in prod, 5 minutes in dev
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico'].includes(ext)) {
        // Images can be cached longer
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log('Serving static files from current directory');
});