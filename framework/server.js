import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3003;

const MIME = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
    // GUARDAR JSON
    if (req.method === 'POST' && req.url === '/guardar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { archivo, contenido } = JSON.parse(body);
                const ruta = path.join(__dirname, archivo);
                // Solo permitir guardar .json dentro del directorio
                if (!ruta.startsWith(__dirname) || !ruta.endsWith('.json')) {
                    res.writeHead(403);
                    res.end('No permitido');
                    return;
                }
                fs.writeFileSync(ruta, JSON.stringify(contenido, null, 4), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
                console.log(`Guardado: ${archivo}`);
            } catch (e) {
                res.writeHead(500);
                res.end(e.message);
            }
        });
        return;
    }

    // SERVIR ARCHIVOS ESTÁTICOS
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`V4 Server: http://localhost:${PORT}`);
    console.log(`V4 Editor: http://localhost:${PORT}/editor.html`);
});
