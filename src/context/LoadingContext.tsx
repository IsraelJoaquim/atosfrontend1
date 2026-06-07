'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type LoadingContextType = {
  start: () => void;
  done: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  start: () => {},
  done: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const start = useCallback(() => setCount((c) => c + 1), []);
  const done = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  return (
    <LoadingContext.Provider value={{ start, done }}>
      {count > 0 && <ProgressBar />}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}

function ProgressBar() {
  return (
    <div className="fixed top-14 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
      <div className="h-full bg-accent-cyan animate-progress-bar" />
    </div>
  );
}
