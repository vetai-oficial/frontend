'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/constants';
import { setToken, removeToken } from '@/infra/http-client';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';

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
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        removeToken();
        localStorage.removeItem(STORAGE_KEYS.USER);
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setToken(response.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    setState({ user: response.user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, crmv: string) => {
      const response = await authService.register({ name, email, password, crmv });
      setToken(response.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      setState({ user: response.user, isLoading: false, isAuthenticated: true });
    },
    [],
  );

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
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
