import { io } from 'socket.io-client';

// Configure socket to be more resilient in restricted webviews like Zalo
export const socket = io({
  transports: ['websocket', 'polling'], // Fallback to polling if websocket is blocked
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
});
