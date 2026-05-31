import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = apiUrl.replace(/\/api\/?$/, '');

let socket = null;

export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}