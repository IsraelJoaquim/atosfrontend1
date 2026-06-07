'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password', { email, token, password }, false);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="card p-8 glow-cyan text-center space-y-3">
        <p className="text-red-400 text-sm font-mono">Link inválido ou expirado.</p>
        <Link href="/forgot-password" className="text-accent-cyan text-sm hover:underline">
          Solicitar novo link
        </Link>
      </div>
    );
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-status-finalizado/10 mb-2">
                <CheckCircle2 size={24} className="text-status-finalizado" />
              </div>
              <h1 className="font-display font-bold text-xl text-text-primary">
                Senha redefinida!
              </h1>
              <p className="text-text-secondary text-sm">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={18} className="text-accent-cyan" />
                <h1 className="text-text-primary font-display font-bold text-xl">
                  Nova senha
                </h1>
              </div>
              <p className="text-text-muted text-xs font-mono mb-6">
                Digite e confirme sua nova senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
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

                <div>
                  <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs font-mono mt-1">As senhas não coincidem.</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                    <p className="text-status-finalizado text-xs font-mono mt-1 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Senhas coincidem.
                    </p>
                  )}
                </div>

                {error && (
                  <div role="alert" className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword || password.length < 6}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Redefinir senha
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-text-muted text-xs font-mono mt-6">
          <Link href="/login" className="text-accent-cyan hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
