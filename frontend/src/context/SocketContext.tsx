// context/SocketContext.tsx
import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => console.warn('Socket not initialized'),
});

interface SocketProviderProps {
  url: string;
  options?: any;
  children: ReactNode;
}

export const SocketProvider = ({ url, options, children }: SocketProviderProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(url, {
      ...options,
      autoConnect: true,
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
      }
    };
  }, [url, options]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit - socket not connected');
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);