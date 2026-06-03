'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Search, Loader2, X, ChevronDown, Pencil, Check } from 'lucide-react';

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
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState('');

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

  async function handleToggleActive(userId: string, currentActive: boolean) {
    if (!confirm(currentActive ? 'Inativar este usuário?' : 'Reativar este usuário?')) return;
    try {
      await api.put(`/users/${userId}`, { active: !currentActive });
      fetchUsers();
    } catch (e) { console.error(e); }
  }

  async function handleRoleUpdate(userId: string) {
    if (!editingRoleValue) return;
    try {
      await api.put(`/users/${userId}`, { role: editingRoleValue });
      setEditingRole(null);
      fetchUsers();
    } catch (e) { console.error(e); }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary">Usuários</h1>
          <p className="text-text-secondary text-sm mt-0.5">{filtered.length} usuários</p>
        </div>
        <button onClick={() => { setSuccess(''); setShowModal(true); }} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {success && (
        <div className="text-status-finalizado text-sm font-mono bg-status-finalizado/10 border border-status-finalizado/20 rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input className="input pl-9" placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Tabela desktop / Cards mobile */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-accent-cyan" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">Nenhum usuário encontrado.</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
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
                        {editingRole === u.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="input py-1 px-2 text-xs w-28"
                              value={editingRoleValue}
                              onChange={(e) => setEditingRoleValue(e.target.value)}
                            >
                              <option value="usuario">Usuário</option>
                              <option value="tecnico">Técnico</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button onClick={() => handleRoleUpdate(u.id)} className="text-accent-cyan hover:text-accent-cyan_hover">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingRole(null)} className="text-text-muted hover:text-text-primary">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`badge border ${roleConfig[u.role].color}`}>{roleConfig[u.role].label}</span>
                            {u.id !== user?.id && (
                              <button
                                onClick={() => { setEditingRole(u.id); setEditingRoleValue(u.role); }}
                                className="text-text-muted hover:text-text-primary transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge border ${u.active ? 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' : 'text-text-muted bg-bg-border border-bg-border'}`}>
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleToggleActive(u.id, u.active)}
                            className={`text-xs font-mono hover:underline ${u.active ? 'text-red-400' : 'text-status-finalizado'}`}
                          >
                            {u.active ? 'Inativar' : 'Reativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-bg-border">
              {filtered.map((u) => (
                <div key={u.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{u.name}</p>
                      <p className="text-text-muted text-xs font-mono truncate">{u.email}</p>
                    </div>
                    <span className={`badge border shrink-0 ${u.active ? 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' : 'text-text-muted bg-bg-border border-bg-border'}`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {editingRole === u.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="input py-1 px-2 text-xs w-28"
                          value={editingRoleValue}
                          onChange={(e) => setEditingRoleValue(e.target.value)}
                        >
                          <option value="usuario">Usuário</option>
                          <option value="tecnico">Técnico</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleRoleUpdate(u.id)} className="text-accent-cyan"><Check size={14} /></button>
                        <button onClick={() => setEditingRole(null)} className="text-text-muted"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`badge border ${roleConfig[u.role].color}`}>{roleConfig[u.role].label}</span>
                        {u.id !== user?.id && (
                          <button onClick={() => { setEditingRole(u.id); setEditingRoleValue(u.role); }} className="text-text-muted hover:text-text-primary">
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                    )}
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`text-xs font-mono hover:underline ${u.active ? 'text-red-400' : 'text-status-finalizado'}`}
                      >
                        {u.active ? 'Inativar' : 'Reativar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal novo usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
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
