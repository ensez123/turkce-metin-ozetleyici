'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openFAQIndex === idx;
        const buttonId = `faq-button-${idx}`;
        const answerId = `faq-answer-${idx}`;

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
              id={buttonId}
              type="button"
              onClick={() => toggleFAQ(idx)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 cursor-pointer min-h-[52px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <h3 className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-2.5">
                <span className="text-indigo-400 font-bold tabular-nums">{idx + 1}.</span>
                <span>{item.q.replace(/^\d+\.\s*/, '')}</span>
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-indigo-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-purple-400' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={answerId}
                role="region"
                aria-labelledby={buttonId}
                className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200 text-pretty"
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
