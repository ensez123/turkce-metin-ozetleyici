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
  AlertCircle,
  MessageSquareText,
  Send,
  HelpCircle,
  Bot,
  CheckCircle2
} from 'lucide-react';
import { SummaryResult, QAItem } from '@/types';
import { summarizeWithGemini, askQuestionAboutText } from '@/utils/geminiSummarizer';
import { SAMPLE_TEXTS } from '@/utils/mockSummarizer';

const MAX_CHAR_LIMIT = 4000;

const PRESET_QUESTIONS = [
  'Daha detaylı açıkla',
  'Ana fikri tek cümlede söyle',
  'Bu ne anlama geliyor?',
  'Karşıt görüş ne olabilir?'
];

export default function Home() {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Q&A States
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Copy feedback states
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedPoints, setCopiedPoints] = useState<boolean>(false);
  const [copiedQAId, setCopiedQAId] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const qaSectionRef = useRef<HTMLDivElement>(null);

  // Character and word counts
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Lütfen özetlemek için bir metin girin veya yapıştırın.');
      return;
    }

    if (isOverLimit) {
      setErrorMsg(`Metin 4000 karakter sınırını aşıyor (${charCount.toLocaleString()} / 4.000). Lütfen metninizi kısaltın.`);
      return;
    }

    if (inputText.trim().length < 25) {
      setErrorMsg('Metin çok kısa. Anlamlı bir özet için lütfen en az 1-2 cümle metin girin.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setResult(null);
    setQaList([]);
    setQuestionInput('');
    setAskError(null);

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

  const handleAskQuestion = async (textToUse?: string) => {
    const qToAsk = textToUse !== undefined ? textToUse : questionInput;
    if (!qToAsk.trim() || !inputText.trim() || !result) return;

    setAskError(null);
    setIsAsking(true);

    try {
      const answer = await askQuestionAboutText(inputText, result.summary, qToAsk.trim());

      const newItem: QAItem = {
        id: Date.now().toString(),
        question: qToAsk.trim(),
        answer,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setQaList((prev) => [newItem, ...prev]);
      setQuestionInput('');

      // Scroll to QA section
      setTimeout(() => {
        qaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      console.error('Soru sorma hatası:', err);
      setAskError(err.message || 'Soru yanıtlanırken bir hata oluştu.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleSelectPresetQuestion = (questionText: string) => {
    setQuestionInput(questionText);
    if (askError) setAskError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setErrorMsg(null);
        triggerToast('Panodaki metin yapıştırıldı');
      }
    } catch (err) {
      console.error('Pano okunamadı:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMsg(null);
    setQaList([]);
    setQuestionInput('');
    setAskError(null);
  };

  const handleLoadSample = (sampleText: string) => {
    setInputText(sampleText);
    setResult(null);
    setErrorMsg(null);
    setQaList([]);
    setQuestionInput('');
    setAskError(null);
    triggerToast('Örnek metin yüklendi');
  };

  const handleCopySummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopiedSummary(true);
    triggerToast('Kısa özet panoya kopyalandı!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyPoints = () => {
    if (!result) return;
    const formattedPoints = result.keyPoints.map((pt) => `• ${pt}`).join('\n');
    navigator.clipboard.writeText(formattedPoints);
    setCopiedPoints(true);
    triggerToast('Ana noktalar panoya kopyalandı!');
    setTimeout(() => setCopiedPoints(false), 2000);
  };

  const handleCopyQA = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQAId(id);
    triggerToast('Yanıt panoya kopyalandı!');
    setTimeout(() => setCopiedQAId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600/90 text-white text-sm font-medium rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Türkçe Metin Özetleyici
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Akıllı Gemini AI ile Özet & Soru-Cevap</p>
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
      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Hero & Info */}
        <section className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Uzun Metinleri Saniyeler İçinde Özümseyin
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Makalelerinizi veya uzun metinlerinizi girin. Google Gemini yapay zekası 3-5 cümlelik özeti, ana noktaları hazırlasın ve sorularınızı yanıtlasın.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] sm:text-xs font-medium text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>En Yeni Gemini Modeli</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] sm:text-xs font-medium text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>3-5 Cümle Kısa Özet</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] sm:text-xs font-medium text-slate-300">
              <MessageSquareText className="w-3.5 h-3.5 text-purple-400" />
              <span>Akıllı Soru-Cevap</span>
            </div>
          </div>
        </section>

        {/* Input Card */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 transition-all border border-slate-700/50">
          {/* Sample Text Selector & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Örnek Metin:
              </span>
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample.text)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
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
              placeholder="Özetlemek istediğiniz Türkçe metni buraya yapıştırın veya yazın (maks. 4.000 karakter)..."
              rows={8}
              className={`w-full glass-input rounded-xl p-3.5 sm:p-4 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none transition-all resize-y min-h-[200px] ${
                isOverLimit ? 'border-rose-500/80 focus:border-rose-500' : ''
              }`}
            />
          </div>

          {/* Limit Exceeded Warning */}
          {isOverLimit && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200">
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

          {/* Card Footer Info & Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="text-xs text-slate-400 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className={isOverLimit ? 'text-rose-400 font-bold animate-pulse' : ''}>
                {charCount.toLocaleString()} / 4.000 Karakter
              </span>
              <span className="text-slate-600">•</span>
              <span>{wordCount.toLocaleString()} Kelime</span>
            </div>

            <button
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim() || isOverLimit}
              className={`w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base ${
                isLoading || !inputText.trim() || isOverLimit
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-indigo-200" />
                  <span>Gemini Analiz Ediyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
                  <span>Özetle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State Banner */}
        {isLoading && (
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-4 border border-indigo-500/30 animate-pulse-subtle">
            <div className="inline-flex p-3.5 sm:p-4 rounded-full bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-200">Gemini AI Yanıt Hazırlıyor</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Metin işleniyor, 3-5 cümlelik özet ve ana maddeler çıkarılıyor...</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {result && !isLoading && (
          <div ref={resultsRef} className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Metric Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="glass-card rounded-xl p-3 sm:p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Küçülme Oranı</div>
                  <div className="text-sm sm:text-lg font-bold text-emerald-400">%{result.reductionPercentage}</div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-3 sm:p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Kelime Sayısı</div>
                  <div className="text-sm sm:text-lg font-bold text-slate-200">
                    {result.originalWordCount} <ArrowRight className="inline w-3 h-3 text-slate-500" /> {result.summaryWordCount}
                  </div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 glass-card rounded-xl p-3 sm:p-3.5 border border-slate-700/50 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Okuma Süresi</div>
                  <div className="text-sm sm:text-lg font-bold text-slate-200">~{result.estimatedReadTimeSeconds} Saniye</div>
                </div>
              </div>
            </div>

            {/* Summary Box (3-5 Sentences) */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-100">Kısa Özet</h3>
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

              <p className="text-slate-200 text-sm sm:text-lg leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* Key Points (Bullet List) */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <ListCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-100">Ana Noktalar</h3>
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

              <ul className="space-y-2.5 sm:space-y-3">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3 text-slate-300 text-sm sm:text-base leading-snug">
                    <span className="flex shrink-0 items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mt-0.5 border border-indigo-500/20">
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Q&A Section */}
            <div ref={qaSectionRef} className="glass-card rounded-2xl p-5 sm:p-6 border border-purple-500/30 shadow-xl space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-100">Metin Hakkında Soru Sor</h3>
                    <p className="text-xs text-slate-400">Metin veya özet hakkında aklınıza takılan detayları Gemini AI'ya danışın.</p>
                  </div>
                </div>
              </div>

              {/* Preset Sample Questions */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Örnek Sorular (Kutuya Ekle):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetQuestion(q)}
                      disabled={isAsking}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700/60 transition-colors text-left cursor-pointer disabled:opacity-50"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input Form */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => {
                      setQuestionInput(e.target.value);
                      if (askError) setAskError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAsking && questionInput.trim()) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                    placeholder="Örn: Bu ne anlama geliyor? Veya karşıt görüş ne olabilir?"
                    className="flex-1 glass-input rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all"
                  />

                  <button
                    onClick={() => handleAskQuestion()}
                    disabled={isAsking || !questionInput.trim()}
                    className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shrink-0 text-sm ${
                      isAsking || !questionInput.trim()
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-lg shadow-purple-500/25 cursor-pointer'
                    }`}
                  >
                    {isAsking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                        <span>Yanıtlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Sor</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {askError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{askError}</span>
                  </div>
                )}
              </div>

              {/* QA History List */}
              {qaList.length > 0 && (
                <div className="space-y-3.5 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Soru & Yanıt Geçmişi ({qaList.length})</span>
                  </div>

                  <div className="space-y-3.5">
                    {qaList.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-xl p-3.5 sm:p-4 border border-slate-700/80 space-y-2.5 animate-in fade-in duration-300"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs sm:text-sm">
                            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 shrink-0">
                              <HelpCircle className="w-3.5 h-3.5" />
                            </span>
                            <span>{item.question}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                        </div>

                        {/* Answer Content */}
                        <div className="flex items-start gap-2.5 pt-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
                          <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-0.5 shrink-0">
                            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 whitespace-pre-wrap">{item.answer}</div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCopyQA(item.id, `Soru: ${item.question}\nCevap: ${item.answer}`)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedQAId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Kopyalandı</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Kopyala</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Information & FAQ Section */}
        <section className="pt-10 border-t border-slate-800/80 space-y-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Türkçe metin özetleyici ücretsiz mi?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Evet, Türkçe Metin Özetleyici tamamen ücretsizdir. Kayıt gerektirmeden dilediğiniz kadar Türkçe metni saniyeler içinde özetleyebilirsiniz.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Özet çıkarma işleminde hangi yapay zeka modeli kullanılıyor?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Uygulamamız Google Gemini AI altyapısını kullanmaktadır. Türkçe dil bilgisine ve bağlama hakim güncel yapay zeka modelleri ile anlam kaybı yaşanmadan özet çıkarılır.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Hangi tür metinleri özetleyebilirim?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Akademik makaleler, ders notları, haber yazıları, kitap özetleri, iş raporları ve e-postalar dahil olmak üzere 4.000 karaktere kadar tüm Türkçe metinleri özetleyebilirsiniz.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Özetlenen metin hakkında nasıl soru sorabilirim?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Metniniz özetlendikten sonra alt kısımda açılan 'Akıllı Soru-Cevap' bölümünden metnin detayları, ana fikri veya anlamadığınız noktaları hakkında doğrudan yapay zekaya sorular sorabilirsiniz.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Girdiğim metinler ve verilerim saklanıyor mu?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Hayır. Girdiğiniz metinler yalnızca anlık olarak işlenir ve hiçbir sunucuda veya veritabanında kayıt altına alınmaz. Gizliliğiniz güvendedir.",
                    },
                  },
                ],
              }),
            }}
          />

          {/* About Section */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/50 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Türkçe Metin Özetleyici Nedir?</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>Türkçe Metin Özetleyici</strong>, uzun akademik makaleleri, ders notlarını, haberleri ve karmaşık metinleri Google Gemini yapay zekası desteğiyle saniyeler içinde anlaşılır özetlere dönüştüren ücretsiz bir online araçtır. Metninizin özünü koruyarak 3-5 cümlelik kısa özet çıkarır ve önemli vurguları madde madde sunar.
            </p>
          </div>

          {/* Target Audience Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 border border-slate-700/50 space-y-2">
              <h3 className="font-semibold text-slate-200 text-base flex items-center gap-2">
                🎓 Öğrenciler & Akademisyenler
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Yüzlerce sayfalık tezleri, akademik makaleleri ve ders notlarını hızlıca analiz edin. Sınavlara ve araştırmalara zamandan tasarruf ederek hazırlanın.
              </p>
            </div>

            <div className="glass-card rounded-xl p-5 border border-slate-700/50 space-y-2">
              <h3 className="font-semibold text-slate-200 text-base flex items-center gap-2">
                💼 Profesyoneller & İş Dünyası
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Uzun iş raporlarını, e-postaları ve sektör analizlerini saniyeler içinde okuyup karar alma süreçlerinizi hızlandırın.
              </p>
            </div>

            <div className="glass-card rounded-xl p-5 border border-slate-700/50 space-y-2">
              <h3 className="font-semibold text-slate-200 text-base flex items-center gap-2">
                ✍️ İçerik Üreticileri & Yazarlar
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Haberlerin, kaynak yazıların ve rakip içeriklerin ana noktalarını saniyeler içinde çıkararak içerik üretim sürecinizi verimli kılın.
              </p>
            </div>
          </div>

          {/* FAQ Accordion / Cards Section */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/50 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Sıkça Sorulan Sorular (SSS)</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-indigo-300">
                  1. Türkçe metin özetleyici ücretsiz mi?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Evet, aracımız %100 ücretsizdir. Herhangi bir üyelik açmadan veya kredi kartı girmeden doğrudan kullanabilirsiniz.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-indigo-300">
                  2. Hangi yapay zeka teknolojisi kullanılıyor?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Uygulamamız Google Gemini AI altyapısını kullanmaktadır. Gelişmiş doğal dil işleme (NLP) yeteneği sayesinde Türkçe metinleri bağlamından koparmadan özetler.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-indigo-300">
                  3. Hangi tür metinleri özetleyebilirim?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Makaleler, kitap özetleri, haber metinleri, ders notları, iş raporları ve blog yazıları dahil 4.000 karaktere kadar olan tüm Türkçe metinleri özetleyebilirsiniz.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-indigo-300">
                  4. Özetlenen metin hakkında nasıl soru sorabilirim?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Özet oluşturulduktan sonra ekrana gelen 'Akıllı Soru-Cevap' bölümünden metninizle ilgili merak ettiğiniz veya detaylandırmak istediğiniz her şeyi sorabilirsiniz.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-sm sm:text-base text-indigo-300">
                  5. Verilerim ve metinlerim saklanıyor mu?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Metinleriniz ve sorduğunuz sorular hiçbir şekilde veritabanlarımızda kaydedilmez veya saklanmaz. Tüm işlemler anlık olarak gerçekleşir.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-5 sm:py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Türkçe Metin Özetleyici. Tüm hakları saklıdır.</p>
          <p className="text-slate-600">Google Gemini AI & Next.js App Router ile güçlendirilmiştir.</p>
        </div>
      </footer>
    </div>
  );
}
