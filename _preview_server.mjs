import http from 'http';
import { readFile, access } from 'fs/promises';
import { extname, join, normalize } from 'path';

const fileExists = (p) => access(p).then(() => true).catch(() => false);

const ROOT = process.cwd();
const PORT = 3002;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/preview.html';
    // 防目录穿越
    const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    // Next.js 约定：public/ 映射到根路径，静态预览也据此回退
    if (!(await fileExists(filePath))) {
      const pubPath = join(ROOT, 'public', safe);
      if (pubPath.startsWith(ROOT) && await fileExists(pubPath)) filePath = pubPath;
    }
    const data = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes' });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`preview server on http://localhost:${PORT} (root=${ROOT})`);
});
