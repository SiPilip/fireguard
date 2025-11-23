import type { WebSocketServer } from 'ws';

// Deklarasi ini memberitahu TypeScript tentang properti kustom yang kita tambahkan ke scope global.
declare global {
  var wss: (WebSocketServer & { broadcast: (data: string) => void; }) | undefined;
}

export { };
