// io() sin url conecta contra window.location.origin; nginx reenvía
// /socket.io/ al backend. Auth va por cookie httpOnly (withCredentials).
import { io } from "socket.io-client";

let socket = null;

// VITE_TIEMPO_REAL=false (despliegue en Vercel): el rewrite no pasa websockets, así
// que no se intenta conectar. getSocket() queda en null y cada pantalla ya lo tolera:
// las notificaciones se ven al recargar en vez de llegar en vivo.
const TIEMPO_REAL = String(import.meta.env.VITE_TIEMPO_REAL ?? "true").toLowerCase() !== "false";

export function connectSocket() {
  if (!TIEMPO_REAL) return null;
  if (!socket) {
    socket = io({
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
}

export function getSocket() {
  return socket;
}
