'use client';

import React, { memo } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  ListCheck,
  Clock,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { SummaryResult } from '@/types';

interface SummaryResultsProps {
  result: SummaryResult;
  copiedSummary: boolean;
  copiedPoints: boolean;
  onCopySummary: () => void;
  onCopyPoints: () => void;
}

export const SummaryResults = memo(function SummaryResults({
  result,
  copiedSummary,
  copiedPoints,
  onCopySummary,
  onCopyPoints,
}: SummaryResultsProps) {
  return (
    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SaaS Dashboard Stats Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-700/60 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Küçülme Oranı</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400">%{result.reductionPercentage}</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-700/60 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Kelime Değişimi</div>
            <div className="text-sm sm:text-lg font-bold text-slate-200 flex items-center gap-1">
              <span>{result.originalWordCount}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-indigo-300">{result.summaryWordCount}</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 glass-card rounded-xl p-4 border border-slate-700/60 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Okuma Tasarrufu</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-100">~{result.estimatedReadTimeSeconds} Saniye</div>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-indigo-500/40 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100">Kısa Özet</h3>
              <span className="text-xs text-slate-400 font-normal sm:hidden">(3-5 Cümle)</span>
            </div>
            <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-medium hidden sm:inline">
              3-5 Cümle
            </span>
          </div>

          <button
            onClick={onCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>

        <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-normal pt-1">
          {result.summary}
        </p>
      </div>

      {/* Key Points Section */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-700/70 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ListCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-100">Ana Noktalar</h3>
          </div>

          <button
            onClick={onCopyPoints}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedPoints ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>

        <ul className="space-y-3 pt-1">
          {result.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-200 text-sm sm:text-base leading-snug p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md mt-0.5">
                {index + 1}
              </span>
              <span className="pt-0.5">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
