'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Sparkles,
  FileText,
  Trash2,
  Clipboard,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_TEXTS } from '@/utils/mockSummarizer';
import { useSummarizerContext } from './SummarizerContext';

export function SummarizerForm() {
  const {
    state: { inputText, isLoading, errorMsg },
    actions: {
      setInputText,
      setErrorMsg,
      handleSummarize,
      handleLoadSample,
      handlePaste,
      handleClear,
    },
    meta: { maxCharLimit },
  } = useSummarizerContext();

  const charCount = inputText.length;
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const isOverLimit = charCount > maxCharLimit;

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
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Sample Selector & Quick Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span>Örnek Metinler:</span>
          </span>
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample.text)}
              aria-label={`"${sample.title}" örnek metnini yükle`}
              className="px-3 py-2 text-xs rounded-md bg-slate-800/90 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/70 transition-colors cursor-pointer font-medium min-h-[36px] sm:min-h-[40px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {sample.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePaste}
            title="Panodan Yapıştır"
            aria-label="Panodan metin yapıştır"
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer font-medium min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Clipboard className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span>Yapıştır</span>
          </button>
          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              title="Metni Temizle"
              aria-label="Metin giriş alanını temizle"
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 transition-colors cursor-pointer font-medium min-h-[44px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" aria-hidden="true" />
              <span>Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea Input Field with Accessible Label */}
      <div className="relative z-10">
        <label htmlFor="summary-input" className="sr-only">
          Özetlenecek Türkçe Metin
        </label>
        <textarea
          id="summary-input"
          name="inputText"
          value={inputText}
          onChange={handleTextChange}
          autoComplete="off"
          placeholder="Özetlemek istediğiniz Türkçe metni buraya yapıştırın veya yazın (maks. 4.000 karakter)…"
          rows={8}
          className={`w-full glass-input rounded-xl p-4 sm:p-5 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all resize-y min-h-[220px] ${
            isOverLimit ? 'border-rose-500/80 focus-visible:ring-rose-500' : ''
          }`}
        />
      </div>

      {/* Character Progress Limit Bar */}
      <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden" aria-hidden="true">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit ? 'bg-rose-500' : charCount > 3500 ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}
          style={{ width: `${Math.min(100, (charCount / maxCharLimit) * 100)}%` }}
        />
      </div>

      {/* Limit Exceeded Warning */}
      {isOverLimit && (
        <div role="alert" aria-live="polite" className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
          <span>Metin 4000 karakter sınırını aşıyor ({charCount.toLocaleString('tr-TR')} / 4.000). Lütfen metninizi kısaltın.</span>
        </div>
      )}

      {/* Standard Error Banner */}
      {errorMsg && !isOverLimit && (
        <div role="alert" aria-live="polite" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Footer Info & Primary CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 relative z-10">
        <div className="text-xs text-slate-400 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start font-medium tabular-nums">
          <span className={isOverLimit ? 'text-rose-400 font-bold animate-pulse' : ''}>
            {charCount.toLocaleString('tr-TR')} / 4.000 Karakter
          </span>
          <span className="text-slate-600" aria-hidden="true">•</span>
          <span>{wordCount.toLocaleString('tr-TR')} Kelime</span>
        </div>

        <button
          type="button"
          onClick={handleSummarize}
          disabled={isLoading || !inputText.trim() || isOverLimit}
          aria-label={isLoading ? 'Metin özetleniyor, lütfen bekleyin' : 'Metni ücretsiz özetle'}
          className={`w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base min-h-[48px] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
            isLoading || !inputText.trim() || isOverLimit
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer cta-glow'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-200" aria-hidden="true" />
              <span>Gemini Analiz Ediyor…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" aria-hidden="true" />
              <span>Metni Ücretsiz Özetle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
