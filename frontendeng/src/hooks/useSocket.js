import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.API_URL;

export const useSocket = () => {
  const socketRef = useRef();

  useEffect(() => {

    socketRef.current = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
}; 