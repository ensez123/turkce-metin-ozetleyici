'use client';

import React, { createContext, use, useState, useRef, useCallback, useEffect } from 'react';
import { SummaryResult, QAItem } from '@/types';
import { summarizeWithGemini, askQuestionAboutText } from '@/utils/geminiSummarizer';
import { track } from '@vercel/analytics';

const MAX_CHAR_LIMIT = 4000;

export interface SummarizerState {
  inputText: string;
  isLoading: boolean;
  result: SummaryResult | null;
  errorMsg: string | null;
  questionInput: string;
  isAsking: boolean;
  askError: string | null;
  qaList: QAItem[];
  toastMessage: string | null;
  copiedSummary: boolean;
  copiedPoints: boolean;
  copiedQAId: string | null;
}

export interface SummarizerActions {
  setInputText: (text: string) => void;
  setErrorMsg: (msg: string | null) => void;
  setQuestionInput: (text: string) => void;
  setAskError: (msg: string | null) => void;
  handleSummarize: () => Promise<void>;
  handleAskQuestion: (textToUse?: string) => Promise<void>;
  handleSelectPresetQuestion: (questionText: string) => void;
  handlePaste: () => Promise<void>;
  handleClear: () => void;
  handleLoadSample: (sampleText: string) => void;
  handleCopySummary: () => void;
  handleCopyPoints: () => void;
  handleCopyQA: (id: string, text: string) => void;
}

export interface SummarizerMeta {
  resultsRef: React.RefObject<HTMLDivElement | null>;
  qaSectionRef: React.RefObject<HTMLDivElement | null>;
  maxCharLimit: number;
}

export interface SummarizerContextValue {
  state: SummarizerState;
  actions: SummarizerActions;
  meta: SummarizerMeta;
}

const SummarizerContext = createContext<SummarizerContextValue | null>(null);

export function useSummarizerContext() {
  const context = use(SummarizerContext);
  if (!context) {
    throw new Error('useSummarizerContext must be used within a SummarizerProvider');
  }
  return context;
}

export function SummarizerProvider({ children }: { children: React.ReactNode }) {
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

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const qaSectionRef = useRef<HTMLDivElement | null>(null);

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
      setErrorMsg(`Metin 4000 karakter sınırını aşıyor (${inputText.length.toLocaleString('tr-TR')} / 4.000). Lütfen metninizi kısaltın.`);
      return;
    }

    if (inputText.trim().length < 25) {
      setErrorMsg('Metin çok kısa. Anlamlı bir özet için lütfen en az 1–2 cümle metin girin.');
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

        setQaList((prev) => [newItem, ...prev]);
        setQuestionInput('');

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

  const state: SummarizerState = {
    inputText,
    isLoading,
    result,
    errorMsg,
    questionInput,
    isAsking,
    askError,
    qaList,
    toastMessage,
    copiedSummary,
    copiedPoints,
    copiedQAId,
  };

  const actions: SummarizerActions = {
    setInputText,
    setErrorMsg,
    setQuestionInput,
    setAskError,
    handleSummarize,
    handleAskQuestion,
    handleSelectPresetQuestion,
    handlePaste,
    handleClear,
    handleLoadSample,
    handleCopySummary,
    handleCopyPoints,
    handleCopyQA,
  };

  const meta: SummarizerMeta = {
    resultsRef,
    qaSectionRef,
    maxCharLimit: MAX_CHAR_LIMIT,
  };

  return (
    <SummarizerContext value={{ state, actions, meta }}>
      {children}
    </SummarizerContext>
  );
}
