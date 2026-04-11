import type { WebSocketServer } from 'ws';

declare module '*.css';

// Deklarasi ini memberitahu TypeScript tentang properti kustom yang kita tambahkan ke scope global.
declare global {
  var wss: (WebSocketServer & { broadcast: (data: string) => void; }) | undefined;
}

export { };
