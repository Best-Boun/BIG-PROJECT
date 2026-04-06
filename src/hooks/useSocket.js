import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function useSocket() {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const s = socketRef.current;
    if (!s.connected) s.connect();
    return () => {};
  }, []);

  return socketRef.current;
}
