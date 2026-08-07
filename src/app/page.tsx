'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  FileText,
  Trash2,
  Copy,
  Check,
  Clipboard,
  ListCheck,
  Zap,
  Clock,
  TrendingDown,
  BookOpen,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SummaryResult } from '@/types';
import { summarizeWithGemini } from '@/utils/geminiSummarizer';
import { SAMPLE_TEXTS } from '@/utils/mockSummarizer';

export default function Home() {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy feedback states
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedPoints, setCopiedPoints] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Character and word counts
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Lütfen özetlemek için bir metin girin veya yapıştırın.');
      return;
    }

    if (inputText.trim().length < 25) {
      setErrorMsg('Metin çok kısa. Anlamlı bir özet için lütfen en az 1-2 cümle metin girin.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setResult(null);

    try {
      const summaryRes = await summarizeWithGemini(inputText);
      setResult(summaryRes);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Özetleme Hatası:', err);
      setErrorMsg(err.message || 'Özetleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setErrorMsg(null);
      }
    } catch (err) {
      console.error('Pano okunamadı:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMsg(null);
  };

  const handleLoadSample = (sampleText: string) => {
    setInputText(sampleText);
    setResult(null);
    setErrorMsg(null);
  };

  const handleCopySummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyPoints = () => {
    if (!result) return;
    const formattedPoints = result.keyPoints.map((pt) => `• ${pt}`).join('\n');
    navigator.clipboard.writeText(formattedPoints);
    setCopiedPoints(true);
    setTimeout(() => setCopiedPoints(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Türkçe Metin Özetleyici
              </h1>
              <p className="text-xs text-slate-400 font-medium">Akıllı Gemini AI ile Anında Özet</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Gemini AI Destekli
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Hero & Info */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
            Uzun Metinleri Saniyeler İçinde Özümseyin
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Makalelerinizi veya uzun metinlerinizi girin. Google Gemini yapay zekası 3-5 cümlelik özeti ve ana noktaları anında hazırlasın.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>En Yeni Gemini Modeli</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>3-5 Cümle Kısa Özet</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <ListCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Madde Madde Ana Noktalar</span>
            </div>
          </div>
        </section>

        {/* Input Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 transition-all border border-slate-700/50">
          {/* Sample Text Selector & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Örnek Metin Yükle:
              </span>
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample.text)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePaste}
                title="Panodan Yapıştır"
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                <span>Yapıştır</span>
              </button>
              {inputText && (
                <button
                  onClick={handleClear}
                  title="Metni Temizle"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
                  <span>Temizle</span>
                </button>
              )}
            </div>
          </div>

          {/* Textarea Area */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Özetlemek istediğiniz Türkçe metni buraya yapıştırın veya yazın..."
              rows={9}
              className="w-full glass-input rounded-xl p-4 text-slate-100 placeholder-slate-500 text-base focus:outline-none transition-all resize-y min-h-[220px]"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card Footer Info & Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <span>{charCount.toLocaleString()} Karakter</span>
              <span className="text-slate-600">•</span>
              <span>{wordCount.toLocaleString()} Kelime</span>
            </div>

            <button
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                isLoading || !inputText.trim()
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer'
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
                  <span>Özetle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State Banner */}
        {isLoading && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-indigo-500/30 animate-pulse-subtle">
            <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Gemini AI Yanıt Hazırlıyor</h3>
              <p className="text-sm text-slate-400 mt-1">Metin işleniyor, 3-5 cümlelik özet ve ana maddeler çıkarılıyor...</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {result && !isLoading && (
          <div ref={resultsRef} className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Metric Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Küçülme Oranı</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">%{result.reductionPercentage}</div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Kelime Sayısı</div>
                  <div className="text-base sm:text-lg font-bold text-slate-200">
                    {result.originalWordCount} <ArrowRight className="inline w-3 h-3 text-slate-500" /> {result.summaryWordCount}
                  </div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 glass-card rounded-xl p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Okuma Süresi</div>
                  <div className="text-base sm:text-lg font-bold text-slate-200">~{result.estimatedReadTimeSeconds} Saniye</div>
                </div>
              </div>
            </div>

            {/* Summary Box (3-5 Sentences) */}
            <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100">Kısa Özet</h3>
                  <span className="text-xs text-slate-400 font-normal hidden sm:inline">(3-5 Cümle)</span>
                </div>

                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
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

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* Key Points (Bullet List) */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <ListCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100">Ana Noktalar</h3>
                </div>

                <button
                  onClick={handleCopyPoints}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
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

              <ul className="space-y-3">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300 text-base leading-snug">
                    <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mt-0.5 border border-indigo-500/20">
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Türkçe Metin Özetleyici. Tüm hakları saklıdır.</p>
          <p className="text-slate-600">Google Gemini AI & Next.js App Router ile güçlendirilmiştir.</p>
        </div>
      </footer>
    </div>
  );
}
