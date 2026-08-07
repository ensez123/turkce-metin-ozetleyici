'use client';

import React, { memo } from 'react';
import {
  MessageSquareText,
  HelpCircle,
  RefreshCw,
  Send,
  AlertCircle,
  Bot,
  Check,
  Copy,
} from 'lucide-react';
import { QAItem } from '@/types';

const PRESET_QUESTIONS = [
  'Daha detaylı açıkla',
  'Ana fikri tek cümlede söyle',
  'Bu ne anlama geliyor?',
  'Karşıt görüş ne olabilir?'
];

interface QuestionAnsweringProps {
  questionInput: string;
  setQuestionInput: (val: string) => void;
  isAsking: boolean;
  askError: string | null;
  setAskError: (msg: string | null) => void;
  qaList: QAItem[];
  copiedQAId: string | null;
  onAskQuestion: (qText?: string) => void;
  onSelectPreset: (qText: string) => void;
  onCopyQA: (id: string, text: string) => void;
  qaSectionRef?: React.RefObject<HTMLDivElement | null>;
}

export const QuestionAnswering = memo(function QuestionAnswering({
  questionInput,
  setQuestionInput,
  isAsking,
  askError,
  setAskError,
  qaList,
  copiedQAId,
  onAskQuestion,
  onSelectPreset,
  onCopyQA,
  qaSectionRef,
}: QuestionAnsweringProps) {
  return (
    <div ref={qaSectionRef} className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/35 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <MessageSquareText className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-100">Metin Hakkında Soru Sor</h2>
            <p className="text-xs text-slate-400">Metin veya özet hakkında aklınıza takılan detayları Gemini AI'ya danışın.</p>
          </div>
        </div>
      </div>

      {/* Preset Sample Questions Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
          <span>Hazır Sorular:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset(q)}
              disabled={isAsking}
              aria-label={`"${q}" sorusunu seç`}
              className="px-3 py-2 text-xs rounded-lg bg-slate-800/80 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-slate-700/70 transition-colors text-left cursor-pointer disabled:opacity-50 font-medium min-h-[38px] focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Question Form */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <label htmlFor="question-input" className="sr-only">
              Metin hakkında soru sorun
            </label>
            <input
              id="question-input"
              name="questionInput"
              type="text"
              value={questionInput}
              onChange={(e) => {
                setQuestionInput(e.target.value);
                if (askError) setAskError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAsking && questionInput.trim()) {
                  e.preventDefault();
                  onAskQuestion();
                }
              }}
              autoComplete="off"
              placeholder="Örn: Bu ne anlama geliyor? Veya karşıt görüş ne olabilir?…"
              className="w-full glass-input rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all min-h-[48px]"
            />
          </div>

          <button
            type="button"
            onClick={() => onAskQuestion()}
            disabled={isAsking || !questionInput.trim()}
            aria-label={isAsking ? 'Soru yanıtlanıyor, lütfen bekleyin' : 'Soruyu gönder'}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shrink-0 text-sm min-h-[48px] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
              isAsking || !questionInput.trim()
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-lg shadow-purple-500/25 cursor-pointer'
            }`}
          >
            {isAsking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" aria-hidden="true" />
                <span>Yanıtlanıyor…</span>
              </>
            ) : (
              <>
                <span>Sor</span>
                <Send className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {askError && (
          <div role="alert" aria-live="polite" className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{askError}</span>
          </div>
        )}
      </div>

      {/* Q&A Chat History */}
      {qaList.length > 0 && (
        <div role="log" aria-live="polite" aria-label="Soru ve yanıt geçmişi" className="space-y-3.5 pt-4 border-t border-slate-800/80">
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
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <span>{item.question}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">{item.timestamp}</span>
                </div>

                <div className="flex items-start gap-2.5 pt-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
                  <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400 mt-0.5 shrink-0">
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 whitespace-pre-wrap">{item.answer}</div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => onCopyQA(item.id, `Soru: ${item.question}\nCevap: ${item.answer}`)}
                    aria-label={copiedQAId === item.id ? 'Yanıt panoya kopyalandı' : 'Yanıtı panoya kopyala'}
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 transition-colors cursor-pointer min-h-[38px] focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                  >
                    {copiedQAId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" aria-hidden="true" />
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
  );
});
