// hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useSocket = (
  url: string,
  options?: UseSocketOptions
): {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
} => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(url, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      options?.onConnect?.();
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      options?.onDisconnect?.();
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      options?.onError?.(error);
    });

    socketRef.current.connect();
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
  };
};