'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { SummaryResult, QAItem } from '@/types';
import { summarizeWithGemini, askQuestionAboutText } from '@/utils/geminiSummarizer';
import { track } from '@vercel/analytics';
import { SummarizerForm } from './SummarizerForm';
import { SummaryResults } from './SummaryResults';
import { QuestionAnswering } from './QuestionAnswering';

const MAX_CHAR_LIMIT = 4000;

export function SummarizerApp() {
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

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) {
      setErrorMsg('Lütfen özetlemek için bir metin girin veya yapıştırın.');
      return;
    }

    if (inputText.length > MAX_CHAR_LIMIT) {
      setErrorMsg(`Metin 4000 karakter sınırını aşıyor (${inputText.length.toLocaleString()} / 4.000). Lütfen metninizi kısaltın.`);
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
  }, [inputText]);

  const handleAskQuestion = useCallback(
    async (textToUse?: string) => {
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

        // Functional state update (rerender-functional-setstate)
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
    },
    [questionInput, inputText, result]
  );

  const handleSelectPresetQuestion = useCallback((questionText: string) => {
    setQuestionInput(questionText);
    setAskError(null);
  }, []);

  const handlePaste = useCallback(async () => {
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
  }, [triggerToast]);

  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
    setErrorMsg(null);
    setQaList([]);
    setQuestionInput('');
    setAskError(null);
  }, []);

  const handleLoadSample = useCallback(
    (sampleText: string) => {
      track('load_sample_clicked');
      setInputText(sampleText);
      setResult(null);
      setErrorMsg(null);
      setQaList([]);
      setQuestionInput('');
      setAskError(null);
      triggerToast('Örnek metin yüklendi');
    },
    [triggerToast]
  );

  const handleCopySummary = useCallback(() => {
    if (!result) return;
    track('copy_summary_clicked');
    navigator.clipboard.writeText(result.summary);
    setCopiedSummary(true);
    triggerToast('Kısa özet panoya kopyalandı!');
    setTimeout(() => setCopiedSummary(false), 2000);
  }, [result, triggerToast]);

  const handleCopyPoints = useCallback(() => {
    if (!result) return;
    const formattedPoints = result.keyPoints.map((pt) => `• ${pt}`).join('\n');
    navigator.clipboard.writeText(formattedPoints);
    setCopiedPoints(true);
    triggerToast('Ana noktalar panoya kopyalandı!');
    setTimeout(() => setCopiedPoints(false), 2000);
  }, [result, triggerToast]);

  const handleCopyQA = useCallback(
    (id: string, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedQAId(id);
      triggerToast('Yanıt panoya kopyalandı!');
      setTimeout(() => setCopiedQAId(null), 2000);
    },
    [triggerToast]
  );

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600/90 text-white text-sm font-medium rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Input Card Container */}
      <SummarizerForm
        inputText={inputText}
        setInputText={setInputText}
        isLoading={isLoading}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        onSummarize={handleSummarize}
        onLoadSample={handleLoadSample}
        onPaste={handlePaste}
        onClear={handleClear}
      />

      {/* Loading State Banner */}
      {isLoading && (
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-indigo-500/40 animate-pulse-subtle shadow-2xl">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Gemini Yapay Zekası Yanıt Hazırlıyor</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Metniniz işleniyor, 3-5 cümlelik özet, ana maddeler ve akıllı yanıtlar üretiliyor...
            </p>
          </div>
        </div>
      )}

      {/* Results Display Area */}
      {result && !isLoading && (
        <div ref={resultsRef} className="space-y-6">
          <SummaryResults
            result={result}
            copiedSummary={copiedSummary}
            copiedPoints={copiedPoints}
            onCopySummary={handleCopySummary}
            onCopyPoints={handleCopyPoints}
          />

          <QuestionAnswering
            questionInput={questionInput}
            setQuestionInput={setQuestionInput}
            isAsking={isAsking}
            askError={askError}
            setAskError={setAskError}
            qaList={qaList}
            copiedQAId={copiedQAId}
            onAskQuestion={handleAskQuestion}
            onSelectPreset={handleSelectPresetQuestion}
            onCopyQA={handleCopyQA}
            qaSectionRef={qaSectionRef}
          />
        </div>
      )}
    </>
  );
}
