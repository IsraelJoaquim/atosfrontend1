'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Ticket, Users, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Chamados', icon: Ticket },
  { href: '/users', label: 'Usuários', icon: Users, adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 w-full bg-bg-secondary border-b border-bg-border">
        <div className="mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display text-xl font-extrabold tracking-tighter text-text-primary">
              AT<span className="text-accent-cyan">OS</span>
            </span>
            {user?.tenantName && (
              <>
                <span className="text-text-muted text-sm font-mono">/</span>
                <span className="text-text-secondary text-x1 font-bold truncate max-w-[120px]">
                  {user.tenantName}
                </span>
              </>
            )}
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {filtered.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-accent-cyan_dim text-accent-cyan border border-accent-cyan/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User menu desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0 relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-card transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent-cyan_dim border border-accent-cyan/30 flex items-center justify-center text-accent-cyan text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-text-primary text-xs font-medium leading-tight">{user?.name}</p>
                <p className={`text-xs font-mono leading-tight ${roleColors[user?.role || 'usuario']}`}>
                  {roleLabels[user?.role || 'usuario']}
                </p>
              </div>
              <ChevronDown size={14} className={`text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 card py-1 shadow-cyan-md z-20">
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Hamburguer mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-bg-border bg-bg-secondary px-4 py-3 space-y-1 animate-fade-in">
            {filtered.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-accent-cyan_dim text-accent-cyan border border-accent-cyan/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}

            {/* User info mobile */}
            <div className="pt-2 mt-2 border-t border-bg-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-accent-cyan_dim border border-accent-cyan/30 flex items-center justify-center text-accent-cyan text-xs font-bold shrink-0">
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
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
