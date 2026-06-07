'use client';

import { useEffect } from 'react';
import { useLoading } from '@/context/LoadingContext';
import { registerLoadingDispatch } from '@/lib/api';

export function LoadingBridge() {
  const { start, done } = useLoading();

  useEffect(() => {
    registerLoadingDispatch({ start, done });
  }, [start, done]);

  return null;
}
