import { io } from 'socket.io-client';

// Stessa origine del frontend (in produzione) o proxy verso :3000 (in locale).
export const socket = io('/', {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
