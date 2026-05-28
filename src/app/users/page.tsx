'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Search, Loader2, X, ChevronDown } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tecnico' | 'usuario';
  active: boolean;
  email_verified: boolean;
  createdAt: string;
};

const roleConfig = {
  admin: { label: 'Admin', color: 'text-role-admin bg-role-admin/10 border-role-admin/20' },
  tecnico: { label: 'Técnico', color: 'text-role-tecnico bg-role-tecnico/10 border-role-tecnico/20' },
  usuario: { label: 'Usuário', color: 'text-role-usuario bg-role-usuario/10 border-role-usuario/20' },
};

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'usuario' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/dashboard'); return; }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    try {
      const data = await api.get<User[]>('/users');
      setUsers(data);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/register', { ...form, tenantId: user?.tenantId }, false);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'usuario' });
      setSuccess('Usuário criado! Um e-mail de verificação foi enviado.');
      fetchUsers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar usuário');
    } finally { setSubmitting(false); }
  }

  async function handleDeactivate(userId: string) {
    if (!confirm('Inativar este usuário?')) return;
    try { await api.delete(`/users/${userId}`); fetchUsers(); }
    catch (e) { console.error(e); }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Usuários</h1>
          <p className="text-text-secondary text-sm mt-1">{filtered.length} usuários</p>
        </div>
        <button onClick={() => { setSuccess(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Novo Usuário
        </button>
      </div>

      {success && (
        <div className="text-status-finalizado text-sm font-mono bg-status-finalizado/10 border border-status-finalizado/20 rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input className="input pl-9" placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-accent-cyan" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">Nenhum usuário encontrado.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">E-mail</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-bg-border/20 transition-colors">
                  <td className="px-5 py-3.5 text-text-primary text-sm">{u.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary text-sm font-mono">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge border ${roleConfig[u.role].color}`}>{roleConfig[u.role].label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge border ${u.active ? 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' : 'text-text-muted bg-bg-border border-bg-border'}`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.active && u.id !== user?.id && (
                      <button onClick={() => handleDeactivate(u.id)} className="text-xs text-red-400 hover:underline font-mono">Inativar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary">Novo Usuário</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">Nome</label>
                <input className="input" placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">E-mail</label>
                <input className="input" type="email" placeholder="email@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">Senha</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">Role</label>
                <div className="relative">
                  <select className="input pr-8 appearance-none cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="usuario">Usuário</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancelar</button>
                <button onClick={handleCreate} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}Criar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
