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
  CheckCircle2,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { SummaryResult, QAItem } from '@/types';
import { summarizeWithGemini, askQuestionAboutText } from '@/utils/geminiSummarizer';
import { SAMPLE_TEXTS } from '@/utils/mockSummarizer';
import { track } from '@vercel/analytics';

const MAX_CHAR_LIMIT = 4000;

const PRESET_QUESTIONS = [
  'Daha detaylı açıkla',
  'Ana fikri tek cümlede söyle',
  'Bu ne anlama geliyor?',
  'Karşıt görüş ne olabilir?'
];

const FAQ_ITEMS = [
  {
    q: '1. Türkçe metin özetleyici ücretsiz mi?',
    a: 'Evet, Türkçe Metin Özetleyici tamamen ücretsizdir. Üyelik açmadan veya kredi kartı girmeden dilediğiniz kadar Türkçe metni saniyeler içinde özetleyebilirsiniz.'
  },
  {
    q: '2. Hangi yapay zeka teknolojisi kullanılıyor?',
    a: 'Uygulamamız Google Gemini AI altyapısını kullanmaktadır. Gelişmiş doğal dil işleme (NLP) yeteneği sayesinde Türkçe metinleri bağlamından koparmadan 3-5 cümlelik özetlere ve ana maddelere dönüştürür.'
  },
  {
    q: '3. Hangi tür metinleri özetleyebilirim?',
    a: 'Akademik makaleler, ders notları, haber yazıları, kitap özetleri, iş raporları ve e-postalar dahil 4.000 karaktere kadar olan tüm Türkçe metinleri özetleyebilirsiniz.'
  },
  {
    q: '4. Özetlenen metin hakkında nasıl soru sorabilirim?',
    a: 'Özet hazırlandıktan sonra açılan "Akıllı Soru-Cevap" bölümünden metnin detayları, ana fikri veya anlamadığınız noktaları hakkında doğrudan yapay zekaya sorular sorabilirsiniz.'
  },
  {
    q: '5. Verilerim ve metinlerim saklanıyor mu?',
    a: 'Metinleriniz ve sorduğunuz sorular hiçbir şekilde veritabanlarımızda kaydedilmez veya saklanmaz. Tüm işlemler anlık olarak gerçekleşir ve gizliliğiniz güvendedir.'
  }
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

  // FAQ Accordion State (first open by default)
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

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

    track('summarize_clicked', { length: inputText.length });

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
    track('load_sample_clicked');
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
    track('copy_summary_clicked');
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
    <div className="min-h-screen flex flex-col justify-between text-slate-100 relative selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600/90 text-white text-sm font-medium rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Türkçe Metin Özetleyici
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Akıllı Gemini AI ile Özet & Soru-Cevap</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#sss-section"
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              SSS
            </a>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm animate-glow-pulse">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Gemini AI Altyapısı
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 py-8 sm:py-12 flex-1 w-full space-y-8 sm:space-y-10">
        {/* Above-the-Fold Hero Section */}
        <section className="text-center space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold animate-glow-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Yapay Zeka Destekli Ücretsiz Metin Özetleme</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
            Uzun Metinleri Saniyeler İçinde Anlaşılır Özetlere Dönüştürün
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Makaleleri, ders notlarını veya raporları saniyeler içinde 3-5 cümlelik net özetlere ve ana maddelere dönüştürün. Kayıt gerekmez, %100 ücretsiz.
          </p>

          {/* Social Proof & Trust Badges Bar */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>10.000+ Başarılı Özet</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Saniyeler İçinde Sonuç</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kayıt Gerektirmez</span>
            </div>
          </div>
        </section>

        {/* Input Card Container */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 sm:p-7 shadow-2xl space-y-4 border border-slate-700/60 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
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
                  onClick={() => handleLoadSample(sample.text)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800/90 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/70 transition-colors cursor-pointer font-medium"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handlePaste}
                title="Panodan Yapıştır"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer font-medium"
              >
                <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Yapıştır</span>
              </button>
              {inputText && (
                <button
                  onClick={handleClear}
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
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
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
              onClick={handleSummarize}
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

        {/* Loading State Banner */}
        {isLoading && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-indigo-500/40 animate-pulse-subtle shadow-2xl">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Gemini Yapay Zekası Yanıt Hazırlıyor</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">Metniniz işleniyor, 3-5 cümlelik özet, ana maddeler ve akıllı yanıtlar üretiliyor...</p>
            </div>
          </div>
        )}

        {/* Results Display Area */}
        {result && !isLoading && (
          <div ref={resultsRef} className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  onClick={handleCopySummary}
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
                  onClick={handleCopyPoints}
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

            {/* Q&A Interactive Section */}
            <div ref={qaSectionRef} className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/35 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-100">Metin Hakkında Soru Sor</h3>
                    <p className="text-xs text-slate-400">Metin veya özet hakkında aklınıza takılan detayları Gemini AI'ya danışın.</p>
                  </div>
                </div>
              </div>

              {/* Preset Sample Questions Chips */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hazır Sorular:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetQuestion(q)}
                      disabled={isAsking}
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-slate-700/70 transition-colors text-left cursor-pointer disabled:opacity-50 font-medium"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Form */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
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
                    className="flex-1 glass-input rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all"
                  />

                  <button
                    onClick={() => handleAskQuestion()}
                    disabled={isAsking || !questionInput.trim()}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shrink-0 text-sm ${
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

              {/* Q&A Chat History */}
              {qaList.length > 0 && (
                <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-400">
                    <span>Soru & Yanıt Geçmişi ({qaList.length})</span>
                  </div>

                  <div className="space-y-3.5">
                    {qaList.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-xl p-4 border border-slate-700/80 space-y-3 animate-in fade-in duration-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs sm:text-sm">
                            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 shrink-0">
                              <HelpCircle className="w-3.5 h-3.5" />
                            </span>
                            <span>{item.question}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                        </div>

                        <div className="flex items-start gap-2.5 pt-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
                          <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400 mt-0.5 shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="flex-1 whitespace-pre-wrap">{item.answer}</div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCopyQA(item.id, `Soru: ${item.question}\nCevap: ${item.answer}`)}
                            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
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

        {/* SEO Information & Interactive FAQ Accordion */}
        <section id="sss-section" className="pt-10 border-t border-slate-800/80 space-y-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQ_ITEMS.map((item) => ({
                  "@type": "Question",
                  name: item.q.replace(/^\d+\.\s*/, ''),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                  },
                })),
              }),
            }}
          />

          {/* About Section */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>Türkçe Metin Özetleyici Nedir?</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>Türkçe Metin Özetleyici</strong>, uzun akademik makaleleri, ders notlarını, haberleri ve karmaşık metinleri Google Gemini yapay zekası desteğiyle saniyeler içinde anlaşılır özetlere dönüştüren ücretsiz bir online araçtır. Metninizin özünü koruyarak 3-5 cümlelik kısa özet çıkarır ve önemli vurguları madde madde sunar.
            </p>
          </div>

          {/* Target Audience Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                🎓 Öğrenciler & Akademisyenler
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Yüzlerce sayfalık tezleri, akademik makaleleri ve ders notlarını hızlıca analiz edin. Sınavlara ve araştırmalara zamandan tasarruf ederek hazırlanın.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                💼 Profesyoneller & İş Dünyası
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Uzun iş raporlarını, e-postaları ve sektör analizlerini saniyeler içinde okuyup karar alma süreçlerinizi hızlandırın.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                ✍️ İçerik Üreticileri & Yazarlar
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Haberlerin, kaynak yazıların ve rakip içeriklerin ana noktalarını saniyeler içinde çıkararak içerik üretim sürecinizi verimli kılın.
              </p>
            </div>
          </div>

          {/* Interactive Accordion FAQ Section */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Sıkça Sorulan Sorular (SSS)</h2>
                <p className="text-xs text-slate-400">Türkçe Metin Özetleyici hakkında merak edilen tüm sorular ve yanıtları</p>
              </div>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-indigo-500/50 bg-slate-900/80 shadow-lg shadow-indigo-500/5'
                        : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFAQIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 cursor-pointer"
                    >
                      <h3 className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-2.5">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span>{item.q.replace(/^\d+\.\s*/, '')}</span>
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-indigo-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-purple-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Türkçe Metin Özetleyici. Tüm hakları saklıdır.</p>
          <p className="text-slate-500">Google Gemini AI & Next.js App Router ile güçlendirilmiştir.</p>
        </div>
      </footer>
    </div>
  );
}

