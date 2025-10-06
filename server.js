// Global error handler untuk mencegah server crash karena error spesifik dari WebSocket
process.on('uncaughtException', (err) => {
  // Di mode development, beberapa error WebSocket yang tidak kritis bisa muncul karena hot-reloading.
  // Kita tangkap di sini agar server tidak crash.
  const isDev = process.env.NODE_ENV !== 'production';
  const nonCriticalErrors = ['WS_ERR_INVALID_CLOSE_CODE', 'WS_ERR_INVALID_UTF8'];

  if (isDev && nonCriticalErrors.includes(err.code)) {
    console.warn(`Caught a non-critical WebSocket error (${err.code}) due to hot-reloading. Ignoring to prevent crash.`);
  } else {
    // Untuk error lainnya, biarkan server crash agar kita tahu ada masalah serius
    console.error('Uncaught Exception, shutting down:', err);
    process.exit(1);
  }
});

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Penanganan khusus untuk file yang diunggah
    if (pathname.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, 'public', pathname);
      
      // Cek apakah file ada sebelum menyajikannya
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // Jika file tidak ada, biarkan Next.js yang menangani (akan 404)
          return handle(req, res, parsedUrl);
        }
        // Sajikan file secara manual
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      });
    } else {
      // Untuk semua request lain, serahkan pada Next.js
      return handle(req, res, parsedUrl);
    }
  });

  // Buat instance WSS setelah server HTTP dibuat
  const wss = new WebSocketServer({ noServer: true });

  // Simpan di global agar bisa diakses oleh API route
  global.wss = wss;

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url, true);

    // Only handle upgrades to our WebSocket endpoint '/ws'
    if (pathname !== '/ws') {
      // For other paths, we can destroy the socket if we are not handling them.
      // This prevents the connection from hanging.
      socket.destroy();
      return;
    }

    console.log('Attempting to upgrade connection to application WebSocket...');
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // Definisikan listener di instance wss tunggal
  wss.on('connection', (ws, request) => {
    console.log('A new client connected to WebSocket.');
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      console.log('Client disconnected.');
    });

    ws.on('error', (error) => {
        console.error('WebSocket Instance Error:', error);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // Definisikan fungsi broadcast di instance wss
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data, (err) => {
          if (err) {
            console.error('Broadcast error:', err);
          }
        });
      }
    });
  };

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});