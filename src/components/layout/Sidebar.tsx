'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Ticket, Users, LogOut, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Chamados', icon: Ticket },
  { href: '/users', label: 'Usuários', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const roleColors: Record<string, string> = {
    admin: 'text-role-admin',
    tecnico: 'text-role-tecnico',
    usuario: 'text-role-usuario',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    tecnico: 'Técnico',
    usuario: 'Usuário',
  };

  const filtered = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside className="w-60 min-h-screen bg-bg-secondary border-r border-bg-border flex flex-col">
      <div className="p-6 border-b border-bg-border">
        <span className="font-display text-2xl font-extrabold tracking-tighter">
          AT<span className="text-accent-cyan">OS </span>
            / {user?.tenantName}
        </span>
        <p className="text-text-muted text-xs font-mono mt-0.5">v1.0.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                ${active
                  ? 'bg-accent-cyan_dim text-accent-cyan border border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                }`}
            >
              <Icon size={16} className={active ? 'text-accent-cyan' : ''} />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-accent-cyan" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-bg-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-cyan_dim border border-accent-cyan/30 flex items-center justify-center text-accent-cyan text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">{user?.name}</p>
            <p className={`text-xs font-mono ${roleColors[user?.role || 'usuario']}`}>
              {roleLabels[user?.role || 'usuario']}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-text-muted hover:text-red-400 text-sm w-full px-3 py-2 rounded-lg hover:bg-red-400/10 transition-all duration-150"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
