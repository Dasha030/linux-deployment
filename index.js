const http = require('http');
const fs = require('fs');
const { Pool } = require('pg');

const config = JSON.parse(fs.readFileSync('/etc/mywebapp/config.json', 'utf8'));
const pool = new Pool(config.db);

function sendResponse(req, res, statusCode, data, isList = false, isSingleNote = false) {
    const acceptHeader = req.headers['accept'] || '';
    
    if (acceptHeader.includes('text/html')) {
        res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
        
        if (typeof data === 'string') {
            res.end(`<html><body>${data}</body></html>`);
        } else if (isList) {
            let html = '<html><body><h1>Notes List</h1><table border="1"><tr><th>ID</th><th>Title</th></tr>';
            data.forEach(note => {
                html += `<tr><td>${note.id}</td><td>${note.title}</td></tr>`;
            });
            html += '</table></body></html>';
            res.end(html);
        } else if (isSingleNote) {
            let html = `<html><body><h1>${data.title}</h1><p>${data.content}</p><small>Created at: ${data.created_at}</small></body></html>`;
            res.end(html);
        }
    } else {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
}

const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;

    if (method === 'GET' && url === '/health/alive') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('OK');
    }

    if (method === 'GET' && url === '/health/ready') {
        try {
            await pool.query('SELECT 1');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('OK');
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end(`Невдалося підключитися до БД: ${err.message}`);
        }
    }

    if (method === 'GET' && url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <html><body>
                <h1>Notes Service API Endpoints</h1>
                <ul>
                    <li>GET /notes - Отримати список нотаток</li>
                    <li>POST /notes - Створити нотатку (JSON body: title, content)</li>
                    <li>GET /notes/&lt;id&gt; - Отримати повний вміст нотатки</li>
                </ul>
            </body></html>
        `);
    }

    if (method === 'GET' && url === '/notes') {
        try {
            const result = await pool.query('SELECT id, title FROM notes ORDER BY id DESC');
            return sendResponse(req, res, 200, result.rows, true, false);
        } catch (err) {
            return sendResponse(req, res, 500, { error: err.message });
        }
    }

    if (method === 'POST' && url === '/notes') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { title, content } = JSON.parse(body);
                const result = await pool.query(
                    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at',
                    [title, content]
                );
                return sendResponse(req, res, 201, result.rows[0]);
            } catch (err) {
                return sendResponse(req, res, 400, { error: 'Некоректний JSON або помилка БД' });
            }
        });
        return;
    }

    if (method === 'GET' && url.startsWith('/notes/')) {
        const id = url.split('/')[2];
        try {
            const result = await pool.query('SELECT id, title, content, created_at FROM notes WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return sendResponse(req, res, 404, { error: 'Нотатку не знайдено' });
            }
            return sendResponse(req, res, 200, result.rows[0], false, true);
        } catch (err) {
            return sendResponse(req, res, 500, { error: err.message });
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(config.port, '127.0.0.1', () => {
    console.log(`Застосунок успішно запущено на http://127.0.0.1:${config.port}`);
});
