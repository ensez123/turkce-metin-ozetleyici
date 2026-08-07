import React from 'react';
import Link from 'next/link';
import { Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center gap-5">
        <div className="p-3.5 rounded-full bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
          <HelpCircle className="size-8" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">404 - Sayfa Bulunamadı</span>
          <h1 className="text-2xl font-extrabold text-slate-100">Aradığınız Sayfa Mevcut Değil</h1>
          <p className="text-sm text-slate-400">
            Aradığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir.
          </p>
        </div>

        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        >
          <Home className="size-4" aria-hidden="true" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );
}
