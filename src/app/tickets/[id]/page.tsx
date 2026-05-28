'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Loader2, ChevronDown, Clock, User, CheckCircle2, Circle, Timer } from 'lucide-react';

type Movimentacao = {
  id: string;
  statusAntes: 'aberto' | 'em_andamento' | 'finalizado';
  statusDepois: 'aberto' | 'em_andamento' | 'finalizado';
  tecnicoNome: string | null;
  observacao: string | null;
  createdAt: string;
};

type TicketDetail = {
  id: string;
  ticket: string;
  title: string;
  description: string;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  movimentacoes: Movimentacao[];
};

const statusConfig = {
  aberto: { label: 'Aberto', color: 'text-status-aberto bg-status-aberto/10 border-status-aberto/20' },
  em_andamento: { label: 'Em andamento', color: 'text-status-em_andamento bg-status-em_andamento/10 border-status-em_andamento/20' },
  finalizado: { label: 'Finalizado', color: 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' },
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function TimelineIcon({ status }: { status: string }) {
  if (status === 'finalizado') return <CheckCircle2 size={13} className="text-status-finalizado shrink-0" />;
  if (status === 'em_andamento') return <Timer size={13} className="text-status-em_andamento shrink-0" />;
  return <Circle size={13} className="text-status-aberto shrink-0" />;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [observacao, setObservacao] = useState('');

  async function fetchTicket() {
    try {
      const data = await api.get<TicketDetail>(`/tickets/${id}`);
      setTicket(data);
    } catch {
      setError('Chamado não encontrado.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTicket(); }, [id]);

  async function handleStatusUpdate() {
    if (!status) return;
    setUpdating(true);
    setError('');
    try {
      await api.put(`/tickets/${id}/status`, { status, observacao: observacao || undefined });
      setObservacao('');
      setStatus('');
      fetchTicket();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  }

  function getTimestamp(targetStatus: 'em_andamento' | 'finalizado') {
    if (!ticket) return null;
    const mov = ticket.movimentacoes.find((m) => m.statusDepois === targetStatus);
    return mov ? mov.createdAt : null;
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-accent-cyan" /></div>;
  if (!ticket) return <div className="text-center text-text-muted text-sm py-20">{error || 'Chamado não encontrado.'}</div>;

  const canUpdateStatus = user?.role === 'tecnico' || user?.role === 'admin';
  const isFinished = ticket.status === 'finalizado';
  const validNextStatuses = ticket.status === 'aberto'
    ? [{ value: 'em_andamento', label: 'Em andamento' }]
    : ticket.status === 'em_andamento'
    ? [{ value: 'finalizado', label: 'Finalizado' }]
    : [];

  const emAndamentoAt = getTimestamp('em_andamento');
  const finalizadoAt = getTimestamp('finalizado');

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={14} />Voltar
      </button>

      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-text-muted font-mono text-xs">{ticket.ticket}</p>
            <h1 className="font-display font-bold text-xl text-text-primary leading-tight">{ticket.title}</h1>
          </div>
          <span className={`badge border shrink-0 ${statusConfig[ticket.status].color}`}>{statusConfig[ticket.status].label}</span>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed">{ticket.description}</p>

        <div className="pt-2 border-t border-bg-border flex flex-wrap gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
            <User size={11} />{ticket.user.name}
          </span>
          {ticket.assignedToName && (
            <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
              <User size={11} className="text-role-tecnico" />
              <span className="text-role-tecnico">{ticket.assignedToName}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
            <Clock size={11} />{fmt(ticket.createdAt)}
          </span>
          {emAndamentoAt && (
            <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
              <Timer size={11} className="text-status-em_andamento/60" />{fmt(emAndamentoAt)}
            </span>
          )}
          {finalizadoAt && (
            <span className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
              <CheckCircle2 size={11} className="text-status-finalizado/60" />{fmt(finalizadoAt)}
            </span>
          )}
        </div>
      </div>

      {canUpdateStatus && !isFinished && validNextStatuses.length > 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="font-display font-semibold text-text-primary text-sm">Atualizar status</h2>
          <div className="relative">
            <select className="input pr-8 appearance-none cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Selecione...</option>
              {validNextStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          <textarea className="input resize-none h-20 text-sm" placeholder="Observação (opcional)..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          <button onClick={handleStatusUpdate} disabled={!status || updating} className="btn-primary flex items-center gap-2 text-sm">
            {updating && <Loader2 size={13} className="animate-spin" />}Confirmar
          </button>
        </div>
      )}

      {ticket.movimentacoes.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <h2 className="font-display font-semibold text-text-primary text-sm">Histórico</h2>
          </div>
          <div className="divide-y divide-bg-border">
            {ticket.movimentacoes.map((mov) => (
              <div key={mov.id} className="px-5 py-4 flex gap-4">
                <div className="pt-0.5"><TimelineIcon status={mov.statusDepois} /></div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-text-primary text-sm">
                      {statusConfig[mov.statusAntes].label}
                      <span className="text-text-muted mx-1.5">→</span>
                      {statusConfig[mov.statusDepois].label}
                    </span>
                    {mov.tecnicoNome && <span className="text-role-tecnico text-xs font-mono">{mov.tecnicoNome}</span>}
                  </div>
                  {mov.observacao && <p className="text-text-secondary text-xs leading-relaxed">{mov.observacao}</p>}
                  <p className="text-text-muted text-xs font-mono">{fmt(mov.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
