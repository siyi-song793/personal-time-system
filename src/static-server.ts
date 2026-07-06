import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const port = parseInt(process.env.PORT || process.env.DEPLOY_RUN_PORT || '5000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

// MIME types for static files
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

const outDir = join(process.cwd(), 'out');

const server = createServer((req, res) => {
  const url = req.url || '/';
  let filePath = join(outDir, url === '/' ? 'index.html' : url);

  // Try to serve the file, or fall back to index.html for SPA routing
  if (!existsSync(filePath) || !filePath.match(/\.\w+$/)) {
    filePath = join(outDir, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(content);
  } catch (err) {
    console.error('Error serving file:', filePath, err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.once('error', err => {
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(port, hostname, () => {
  console.log(`> Static server listening at http://${hostname}:${port}`);
});
