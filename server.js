import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
const port = Number(process.env.PORT) || 4173;
const root = process.cwd();
const contentTypes = {
  '.css': 'text/css; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
};
createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root)) { response.writeHead(403).end('Acceso denegado'); return; }
  try {
    if (!statSync(filePath).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
  }
}).listen(port, () => console.log('CSV Worker disponible en http://localhost:' + port));
