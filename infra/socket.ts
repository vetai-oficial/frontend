import { io, type Socket } from 'socket.io-client';

import { STORAGE_KEYS } from '@/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  socket = io(`${API_BASE_URL}/consultations`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

let notificationsSocket: Socket | null = null;

export function getNotificationsSocket(): Socket {
  if (notificationsSocket?.connected) return notificationsSocket;

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  notificationsSocket = io(`${API_BASE_URL}/notifications`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return notificationsSocket;
}

export function disconnectNotificationsSocket(): void {
  if (notificationsSocket) {
    notificationsSocket.disconnect();
    notificationsSocket = null;
  }
}
