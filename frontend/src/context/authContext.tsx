import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { getProfile, logout as logoutAPI } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    // If no token, set user to null immediately
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // If token exists, fetch user profile
    try {
      const result = await getProfile()
      setUser(result.user)
    } catch (error) {
      console.error('Auth check failed', error);
      setUser(null);
      // Clear invalid token
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAPI();
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout API failed', error);
    } finally {
      // Clear token and user state
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshAuth: checkAuth, logout }}>
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