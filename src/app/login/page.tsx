'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-10 text-center">
          <span className="font-display text-4xl font-extrabold tracking-tighter text-text-primary">
            AT<span className="text-accent-cyan">OS</span>
          </span>
          <p className="text-text-secondary text-sm mt-1 font-mono tracking-widest uppercase">
            Sistema de Chamados
          </p>
        </div>

        <div className="card p-8 glow-cyan">
          <h1 className="text-text-primary font-display font-bold text-xl mb-6">
            Entrar na plataforma
          </h1>

          {verified && (
            <div className="text-status-finalizado text-sm font-mono bg-status-finalizado/10 border border-status-finalizado/20 rounded-lg px-3 py-2 mb-4">
              E-mail verificado com sucesso! Faça login.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div role="alert" className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 py-3"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Entrando...</> : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs font-mono mt-6">
          Não tem conta?{' '}
          <Link href="/register" className="text-accent-cyan hover:underline">
            Cadastrar empresa
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
