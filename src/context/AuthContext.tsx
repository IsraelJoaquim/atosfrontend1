'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('atos_token');
    const storedUser = localStorage.getItem('atos_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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
    router.push('/dashboard');
  }

  function logout() {
    localStorage.removeItem('atos_token');
    localStorage.removeItem('atos_user');
    setToken(null);
    setUser(null);
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
