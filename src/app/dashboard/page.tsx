'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react';

type TicketItem = {
  id: string;
  ticket: string;
  title: string;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  createdAt: string;
};

const statusConfig = {
  aberto: { label: 'Aberto', color: 'text-status-aberto bg-status-aberto/10 border-status-aberto/20' },
  em_andamento: { label: 'Em andamento', color: 'text-status-em_andamento bg-status-em_andamento/10 border-status-em_andamento/20' },
  finalizado: { label: 'Finalizado', color: 'text-status-finalizado bg-status-finalizado/10 border-status-finalizado/20' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TicketItem[]>('/tickets')
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const abertos = tickets.filter((t) => t.status === 'aberto').length;
  const emAndamento = tickets.filter((t) => t.status === 'em_andamento').length;
  const finalizados = tickets.filter((t) => t.status === 'finalizado').length;

  const stats = [
    { label: 'Total de Chamados', value: tickets.length, icon: Ticket, color: 'text-accent-cyan', bg: 'bg-accent-cyan_dim' },
    { label: 'Abertos', value: abertos, icon: AlertCircle, color: 'text-status-aberto', bg: 'bg-status-aberto/10' },
    { label: 'Em Andamento', value: emAndamento, icon: Clock, color: 'text-status-em_andamento', bg: 'bg-status-em_andamento/10' },
    { label: 'Finalizados', value: finalizados, icon: CheckCircle, color: 'text-status-finalizado', bg: 'bg-status-finalizado/10' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Aqui está um resumo do sistema.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-display font-bold mt-1 ${color}`}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-bg-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-text-primary">Chamados Recentes</h2>
          <span className="text-text-muted text-xs font-mono">{tickets.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-text-muted text-sm">Carregando...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">Nenhum chamado encontrado.</div>
        ) : (
          <div className="divide-y divide-bg-border">
            {tickets.slice(0, 8).map((t) => (
              <div key={t.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-bg-border/30 transition-colors">
                <span className="text-text-muted font-mono text-xs w-24 shrink-0">{t.ticket}</span>
                <span className="text-text-primary text-sm flex-1 truncate">{t.title}</span>
                <span className={`badge border ${statusConfig[t.status].color}`}>
                  {statusConfig[t.status].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
