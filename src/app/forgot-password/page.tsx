'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, KeyRound, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/forgot-password', { email }, false);
      setSent(true);
    } catch {
      setError('Erro ao processar solicitação. Tente novamente.');
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
            Ticket Management
          </p>
        </div>

        <div className="card p-8 glow-cyan">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-accent-cyan_dim mb-2">
                <MailCheck size={24} className="text-accent-cyan" />
              </div>
              <h1 className="font-display font-bold text-xl text-text-primary">
                E-mail enviado!
              </h1>
              <p className="text-text-secondary text-sm">
                Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
              </p>
              <p className="text-text-muted text-xs font-mono">
                O link expira em 30 minutos.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={18} className="text-accent-cyan" />
                <h1 className="text-text-primary font-display font-bold text-xl">
                  Esqueci minha senha
                </h1>
              </div>
              <p className="text-text-muted text-xs font-mono mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
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
                    autoFocus
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
                  Enviar link
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-text-muted text-xs font-mono mt-6">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
