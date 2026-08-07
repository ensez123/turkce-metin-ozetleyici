'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Sparkles,
  FileText,
  Trash2,
  Clipboard,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_TEXTS } from '@/utils/mockSummarizer';

const MAX_CHAR_LIMIT = 4000;

interface SummarizerFormProps {
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  onSummarize: () => void;
  onLoadSample: (text: string) => void;
  onPaste: () => void;
  onClear: () => void;
}

export function SummarizerForm({
  inputText,
  setInputText,
  isLoading,
  errorMsg,
  setErrorMsg,
  onSummarize,
  onLoadSample,
  onPaste,
  onClear,
}: SummarizerFormProps) {
  // Derived state memoization (rerender-derived-state-no-effect)
  const charCount = inputText.length;
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
      if (errorMsg) setErrorMsg(null);
    },
    [setInputText, errorMsg, setErrorMsg]
  );

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 sm:p-7 shadow-2xl space-y-4 border border-slate-700/60 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Sample Selector & Quick Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            Örnek Metinler:
          </span>
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample.text)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800/90 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/70 transition-colors cursor-pointer font-medium"
            >
              {sample.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onPaste}
            title="Panodan Yapıştır"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer font-medium"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Yapıştır</span>
          </button>
          {inputText && (
            <button
              onClick={onClear}
              title="Metni Temizle"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 transition-colors cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
              <span>Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea Input Field */}
      <div className="relative z-10">
        <textarea
          value={inputText}
          onChange={handleTextChange}
          placeholder="Özetlemek istediğiniz Türkçe metni buraya yapıştırın veya yazın (maks. 4.000 karakter)..."
          rows={8}
          className={`w-full glass-input rounded-xl p-4 sm:p-5 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none transition-all resize-y min-h-[220px] ${
            isOverLimit ? 'border-rose-500/80 focus:border-rose-500' : ''
          }`}
        />
      </div>

      {/* Character Progress Limit Bar */}
      <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit ? 'bg-rose-500' : charCount > 3500 ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}
          style={{ width: `${Math.min(100, (charCount / MAX_CHAR_LIMIT) * 100)}%` }}
        />
      </div>

      {/* Limit Exceeded Warning */}
      {isOverLimit && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Metin 4000 karakter sınırını aşıyor ({charCount.toLocaleString()} / 4.000). Lütfen metninizi kısaltın.</span>
        </div>
      )}

      {/* Standard Error Banner */}
      {errorMsg && !isOverLimit && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Footer Info & Primary CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 relative z-10">
        <div className="text-xs text-slate-400 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start font-medium">
          <span className={isOverLimit ? 'text-rose-400 font-bold animate-pulse' : ''}>
            {charCount.toLocaleString()} / 4.000 Karakter
          </span>
          <span className="text-slate-600">•</span>
          <span>{wordCount.toLocaleString()} Kelime</span>
        </div>

        <button
          onClick={onSummarize}
          disabled={isLoading || !inputText.trim() || isOverLimit}
          className={`w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base ${
            isLoading || !inputText.trim() || isOverLimit
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer cta-glow'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-200" />
              <span>Gemini Analiz Ediyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Metni Ücretsiz Özetle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
