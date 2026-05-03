'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { STORAGE_KEYS } from '@/constants';
import { setToken, removeToken } from '@/infra/http-client';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';

export function useAuthProvider() {
  const router = useRouter();
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
    router.push('/analytics/dashboard');
  }, [router]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await authService.register({ name, email, password });
      setToken(response.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      setState({ user: response.user, isLoading: false, isAuthenticated: true });
      router.push('/analytics/dashboard');
    },
    [router],
  );

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const can = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;
      const permissions = state.user.permissions ?? [];
      if (permissions.includes('*')) return true;
      const expanded = new Set<string>(permissions);
      permissions.forEach((p: string) => {
        if (p.endsWith(':edit')) {
          expanded.add(p.replace(':edit', ':view'));
        }
      });
      return expanded.has(permission);
    },
    [state.user],
  );

  return { ...state, login, register, logout, can };
}



interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthProvider();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
