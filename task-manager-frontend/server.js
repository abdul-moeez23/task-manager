const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const port = process.env.PORT || 8080;
const root = __dirname;

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);
    
    // Normalize path and prevent directory traversal
    let requestPath = req.url.split('?')[0];
    let safePath = path.normalize(requestPath).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(root, safePath);

    // If root requested, index.html
    if (requestPath === '/') {
        filePath = path.join(root, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        // If file not found or is directory, check extension
        if (err || stats.isDirectory()) {
            let ext = path.extname(filePath);
            // If likely a static asset (has extension), return 404
            if (ext) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            // Otherwise serve index.html (SPA Fallback)
            filePath = path.join(root, 'index.html');
        }

        // Serve the file
        serveFile(filePath, res);
    });
});

function serveFile(filePath, res) {
    let extname = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                 res.writeHead(404);
                 res.end('404 content not found');
            } else {
                 res.writeHead(500);
                 res.end('500 server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
