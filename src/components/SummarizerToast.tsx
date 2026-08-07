'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSummarizerContext } from './SummarizerContext';

export function SummarizerToast() {
  const {
    state: { toastMessage },
  } = useSummarizerContext();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600/90 text-white text-sm font-medium rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <CheckCircle2 className="size-4 text-emerald-200 shrink-0" aria-hidden="true" />
      <span>{toastMessage}</span>
    </div>
  );
}
