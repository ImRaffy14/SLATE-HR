// components/WithSocket.tsx
import { ReactNode } from 'react';
import { SocketProvider } from '../context/SocketContext';

interface WithSocketProps {
  children: ReactNode;
}

const url = import.meta.env.VITE_SERVER_URL

const WithSocket = ({ children }: WithSocketProps) => {
  return (
    <SocketProvider url={url}>
      {children}
    </SocketProvider>
  );
};

export default WithSocket;
