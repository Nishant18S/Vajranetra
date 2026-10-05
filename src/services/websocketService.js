import { apiBaseURL } from './api';

const wsBase = (import.meta.env.VITE_WS_BASE_URL || apiBaseURL.replace(/^http/, 'ws'))
  .replace(/\/api\/v\d+$/, '');

export function openChannel(path, { onMessage, onOpen, onError, onClose } = {}) {
  let socket;
  try {
    socket = new WebSocket(`${wsBase}${path}`);
  } catch (err) {
    onError?.(err);
    return { close: () => {} };
  }
  socket.onopen = (e) => onOpen?.(e);
  socket.onerror = (e) => onError?.(e);
  socket.onclose = (e) => onClose?.(e);
  socket.onmessage = (e) => {
    try { onMessage?.(JSON.parse(e.data)); }
    catch { onMessage?.(e.data); }
  };
  return { close: () => socket.close() };
}