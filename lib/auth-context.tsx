'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@/lib/api';
import { api, setToken, removeToken, ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('vetai_user');
    const token = localStorage.getItem('vetai_token');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        removeToken();
        localStorage.removeItem('vetai_user');
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    setToken(response.access_token);
    localStorage.setItem('vetai_user', JSON.stringify(response.user));
    setState({ user: response.user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.auth.register({ name, email, password });
      setToken(response.access_token);
      localStorage.setItem('vetai_user', JSON.stringify(response.user));
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem('vetai_user');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
