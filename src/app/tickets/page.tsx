'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Search, Loader2, X, ChevronDown } from 'lucide-react';

type Ticket = {
  id: string;
  ticket: string;
  title: string;
  description: string;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  userId: string;
  createdAt: string;
};

const statusConfig = {
  aberto: { label: 'Aberto', color: 'text-status-aberto bg-status-aberto/10 border-status-aberto/20' },
  em_andamento: { label: 'Em andamento', color: 'text-status-em_andamento bg-status-em_andamento/10 border-status-em_andamento/20' },
  finalizado: { label: 'Finalizado', color: 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' },
};

export default function TicketsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function fetchTickets() {
    try {
      const data = await api.get<Ticket[]>('/tickets');
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTickets(); }, []);

  async function handleCreate() {
    if (!form.title || !form.description) { setError('Preencha todos os campos.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/tickets', form, true);
      setShowModal(false);
      setForm({ title: '', description: '' });
      fetchTickets();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar chamado');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, ticketId: string) {
    e.stopPropagation();
    if (!confirm('Deletar este chamado?')) return;
    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchTickets();
    } catch (e) { console.error(e); }
  }

  const filtered = tickets.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.ticket.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Chamados</h1>
          <p className="text-text-secondary text-sm mt-1">{filtered.length} chamados encontrados</p>
        </div>
        {(user?.role === 'usuario' || user?.role === 'admin') && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />Novo Chamado
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-9" placeholder="Buscar por título ou código..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="input pr-8 appearance-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizado">Finalizado</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-accent-cyan" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">Nenhum chamado encontrado.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Código</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Título</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Data</th>
                {user?.role === 'admin' && <th className="text-left px-5 py-3 text-text-muted text-xs font-mono uppercase tracking-wider">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => router.push(`/tickets/${t.id}`)} className="hover:bg-bg-border/20 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 font-mono text-xs text-text-muted">{t.ticket}</td>
                  <td className="px-5 py-3.5 text-text-primary text-sm max-w-xs truncate">{t.title}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge border ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted text-xs font-mono">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                  {user?.role === 'admin' && (
                    <td className="px-5 py-3.5">
                      <button onClick={(e) => handleDelete(e, t.id)} className="text-xs text-red-400 hover:underline font-mono">Deletar</button>
                    </td>
                  )}
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
              <h2 className="font-display font-bold text-text-primary">Novo Chamado</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">Título</label>
                <input className="input" placeholder="Descreva o problema brevemente" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-mono uppercase tracking-widest block mb-2">Descrição</label>
                <textarea className="input resize-none h-28" placeholder="Detalhe o problema..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancelar</button>
                <button onClick={handleCreate} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}Criar Chamado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
