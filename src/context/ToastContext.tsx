'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type Toast = {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
};

type ToastContextType = {
  showToast: (message: string, type?: Toast['type']) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const colors = {
    success: 'bg-status-finalizado/10 border-status-finalizado/30 text-status-finalizado',
    error: 'bg-red-400/ border-red-400/30 text-red-400',
    info: 'bg-accent-cyan_dim border-accent-cyan/30 text-accent-cyan',
  };

  return (
    <div className={`flex items-center gap-2 border text-sm font-mono px-4 py-1 rounded-lg shadow-cyan animate-slide-up ${colors[toast.type || 'info']}`}>
      <CheckCircle2 size={15} className="shrink-0" />
      <span>{toast.message}</span>
      <button onClick={onRemove} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + counter++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-14 mt-1 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}