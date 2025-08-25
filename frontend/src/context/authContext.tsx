import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getProfile } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getProfile()
        setUser(result.user)
      } catch (error) {
        console.error('Auth check failed', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};