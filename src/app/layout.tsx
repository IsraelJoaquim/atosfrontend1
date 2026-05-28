import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'ATOS — Sistema de Chamados',
  description: 'Gerenciamento de chamados técnicos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-primary text-text-primary antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
