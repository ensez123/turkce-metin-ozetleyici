'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-2xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl flex flex-col items-center text-center gap-5">
        <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-slate-100">Bir Hata Oluştu</h1>
          <p className="text-sm text-slate-400">
            Beklenmeyen bir hata ile karşılaşıldı. Lütfen tekrar deneyin veya sayfayı yenileyin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          <span>Tekrar Dene</span>
        </button>
      </div>
    </div>
  );
}
