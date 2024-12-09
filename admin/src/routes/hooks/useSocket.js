import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://192.168.1.100:3000';
export const useSocket = () => {
  const socketRef = useRef();

  useEffect(() => {
    // Khởi tạo socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket']
    });

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};