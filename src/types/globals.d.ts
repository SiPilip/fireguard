import type { WebSocketServer } from 'ws';

// Deklarasi ini memberitahu TypeScript tentang properti kustom yang kita tambahkan ke scope global.
declare global {
  // eslint-disable-next-line no-var
  var wss: (WebSocketServer & { broadcast: (data: string) => void; }) | undefined;
}

export {};
