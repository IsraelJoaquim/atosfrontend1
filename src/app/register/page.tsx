'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, Building2, User, ChevronRight } from 'lucide-react';

type Step = 'tenant' | 'user';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('tenant');

  // tenant
  const [tenantName, setTenantName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantError, setTenantError] = useState('');

  // user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  async function handleTenant(e: FormEvent) {
    e.preventDefault();
    setTenantError('');
    setTenantLoading(true);
    try {
      const data = await api.post<{ tenant: { id: string; name: string } }>(
        '/tenants',
        { name: tenantName },
        false
      );
      setTenantId(data.tenant.id);
      setStep('user');
    } catch (err: unknown) {
      setTenantError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    } finally {
      setTenantLoading(false);
    }
  }

  async function handleUser(e: FormEvent) {
    e.preventDefault();
    setUserError('');
    setUserLoading(true);
    try {
      await api.post(
        '/register',
        { name, email, password, role: 'admin', tenantId },
        false
      );
      router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setUserError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setUserLoading(false);
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

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className={`flex items-center gap-1.5 text-xs font-mono ${step === 'tenant' ? 'text-accent-cyan' : 'text-status-finalizado'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${step === 'tenant' ? 'border-accent-cyan text-accent-cyan' : 'border-status-finalizado text-status-finalizado'}`}>
              1
            </div>
            Empresa
          </div>
          <ChevronRight size={12} className="text-text-muted" />
          <div className={`flex items-center gap-1.5 text-xs font-mono ${step === 'user' ? 'text-accent-cyan' : 'text-text-muted'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${step === 'user' ? 'border-accent-cyan text-accent-cyan' : 'border-text-muted text-text-muted'}`}>
              2
            </div>
            Usuário
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 glow-cyan">
          {step === 'tenant' ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Building2 size={18} className="text-accent-cyan" />
                <h1 className="text-text-primary font-display font-bold text-xl">
                  Cadastrar empresa
                </h1>
              </div>
              <form onSubmit={handleTenant} className="space-y-4">
                <div>
                  <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nome da empresa"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {tenantError && (
                  <div role="alert" className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {tenantError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={tenantLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {tenantLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Continuar
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <User size={18} className="text-accent-cyan" />
                <h1 className="text-text-primary font-display font-bold text-xl">
                  Criar conta admin
                </h1>
              </div>
              <p className="text-text-muted text-xs font-mono mb-6">
                Empresa: <span className="text-accent-cyan">{tenantName}</span>
              </p>
              <form onSubmit={handleUser} className="space-y-4">
                <div>
                  <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
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
                    Senha
                  </label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {userError && (
                  <div role="alert" className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {userError}
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('tenant')}
                    className="btn-ghost flex-1"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={userLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {userLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Cadastrar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-text-muted text-xs font-mono mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
