'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSummarizerContext } from './SummarizerContext';

export function SummarizerLoading() {
  const {
    state: { isLoading },
  } = useSummarizerContext();

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Gemini Yapay Zekası özetinizi oluşturuyor"
      className="glass-card rounded-2xl p-8 text-center space-y-4 border border-indigo-500/40 animate-pulse-subtle shadow-2xl"
    >
      <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
        <Sparkles className="w-8 h-8 animate-spin" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-100">Gemini Yapay Zekası Yanıt Hazırlıyor</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Metniniz işleniyor, 3–5 cümlelik özet, ana maddeler ve akıllı yanıtlar üretiliyor…
        </p>
      </div>
    </div>
  );
}
