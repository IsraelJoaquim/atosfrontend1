'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tecnico' | 'usuario';
  tenantId: string;
  tenantName: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleLogout(expiresAt: number) {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      doLogout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      doLogout();
      router.push('/login');
    }, msUntilExpiry);
  }

  function doLogout() {
    localStorage.removeItem('atos_token');
    localStorage.removeItem('atos_user');
    setToken(null);
    setUser(null);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('atos_token');
    const storedUser = localStorage.getItem('atos_user');

    if (storedToken && storedUser) {
      const expiry = getTokenExpiry(storedToken);

      if (!expiry || expiry < Date.now()) {
        localStorage.removeItem('atos_token');
        localStorage.removeItem('atos_user');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        scheduleLogout(expiry);
      }
    }

    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ token: string; user: User }>(
      '/login',
      { email, password },
      false
    );
    localStorage.setItem('atos_token', data.token);
    localStorage.setItem('atos_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    const expiry = getTokenExpiry(data.token);
    if (expiry) scheduleLogout(expiry);

    router.push('/dashboard');
  }

  function logout() {
    doLogout();
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
