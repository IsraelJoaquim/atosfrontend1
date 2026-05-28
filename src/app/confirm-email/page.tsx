'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, MailCheck } from 'lucide-react';

function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/confirm-email', { email, token }, false);
      router.push('/login?verified=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar e-mail');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="font-display text-4xl font-extrabold tracking-tighter text-text-primary">
            AT<span className="text-accent-cyan">OS</span>
          </span>
          <p className="text-text-secondary text-sm mt-1 font-mono tracking-widest uppercase">
            Sistema de Chamados
          </p>
        </div>

        <div className="card p-8 glow-cyan">
          <div className="flex items-center gap-2 mb-2">
            <MailCheck size={18} className="text-accent-cyan" />
            <h1 className="text-text-primary font-display font-bold text-xl">
              Verificar e-mail
            </h1>
          </div>
          <p className="text-text-muted text-xs font-mono mb-6">
            Digite o código enviado para o seu e-mail.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                E-mail
              </label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                Código de verificação
              </label>
              <input
                type="text"
                className="input tracking-widest font-mono"
                placeholder="Ex: aB3xY7kZ"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                autoFocus={!!emailFromQuery}
              />
            </div>
            {error && (
              <div role="alert" className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Verificar
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs font-mono mt-6">
          Já verificou?{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailForm />
    </Suspense>
  );
}
