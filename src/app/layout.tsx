import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import '../styles/globals.css';
import { LoadingProvider } from '@/context/LoadingContext';
import { ToastProvider } from '@/context/ToastContext';


export const metadata: Metadata = {
  title: 'ATOS Ticket Management',
  description: 'Gerenciamento de chamados',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
    manifest: '/manifest.json',

};

export default function RootLayout({ children}: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-primary text-text-primary antialiased">
        <LoadingProvider>
            <AuthProvider>
          <ToastProvider>
                  {children}
          </ToastProvider>
            </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
