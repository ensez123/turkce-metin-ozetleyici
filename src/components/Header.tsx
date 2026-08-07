import React from 'react';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none transition-all p-1 -m-1"
          aria-label="Türkçe Metin Özetleyici Ana Sayfa"
        >
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="size-5 sm:size-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Türkçe Metin Özetleyici
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Akıllı Gemini AI ile Özet & Soru-Cevap</p>
          </div>
        </a>

        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#sss-section"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/60 min-h-[44px] inline-flex items-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            SSS
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm animate-glow-pulse">
            <Sparkles className="size-3.5 text-purple-400" aria-hidden="true" />
            Gemini AI Altyapısı
          </span>
        </div>
      </div>
    </header>
  );
}
