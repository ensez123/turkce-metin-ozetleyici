'use client';

import React, { createContext, use, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqContextValue {
  openIndex: number | null;
  toggleFAQ: (index: number) => void;
}

interface FaqItemContextValue {
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

const FaqContext = createContext<FaqContextValue | null>(null);
const FaqItemContext = createContext<FaqItemContextValue | null>(null);

function useFaq() {
  const context = use(FaqContext);
  if (!context) {
    throw new Error('Faq subcomponents must be used within FaqAccordion.Root');
  }
  return context;
}

function useFaqItem() {
  const context = use(FaqItemContext);
  if (!context) {
    throw new Error('FaqItem subcomponents must be used within FaqAccordion.Item');
  }
  return context;
}

function FaqRoot({ children, defaultOpenIndex = 0 }: { children: React.ReactNode; defaultOpenIndex?: number | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggleFAQ = useCallback((index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  return (
    <FaqContext value={{ openIndex, toggleFAQ }}>
      <div className="flex flex-col gap-3">{children}</div>
    </FaqContext>
  );
}

function FaqItemComponent({ index, question, answer, children }: { index: number; question: string; answer: string; children?: React.ReactNode }) {
  const { openIndex } = useFaq();
  const isOpen = openIndex === index;

  return (
    <FaqItemContext value={{ index, question, answer, isOpen }}>
      <div
        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
          isOpen
            ? 'border-indigo-500/50 bg-slate-900/80 shadow-lg shadow-indigo-500/5'
            : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80'
        }`}
      >
        {children ?? (
          <>
            <FaqHeader />
            <FaqContent />
          </>
        )}
      </div>
    </FaqItemContext>
  );
}

function FaqHeader() {
  const { toggleFAQ } = useFaq();
  const { index, question, isOpen } = useFaqItem();
  const buttonId = `faq-button-${index}`;
  const answerId = `faq-answer-${index}`;

  return (
    <button
      id={buttonId}
      type="button"
      onClick={() => toggleFAQ(index)}
      aria-expanded={isOpen}
      aria-controls={answerId}
      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 cursor-pointer min-h-[52px] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
    >
      <h3 className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-2.5">
        <span className="text-indigo-400 font-bold tabular-nums">{index + 1}.</span>
        <span>{question.replace(/^\d+\.\s*/, '')}</span>
      </h3>
      <ChevronDown
        className={`size-5 text-indigo-400 shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-purple-400' : ''
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function FaqContent() {
  const { index, answer, isOpen } = useFaqItem();
  const buttonId = `faq-button-${index}`;
  const answerId = `faq-answer-${index}`;

  if (!isOpen) return null;

  return (
    <div
      id={answerId}
      role="region"
      aria-labelledby={buttonId}
      className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200 text-pretty"
    >
      {answer}
    </div>
  );
}

export const FaqAccordionCompound = {
  Root: FaqRoot,
  Item: FaqItemComponent,
  Header: FaqHeader,
  Content: FaqContent,
};

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <FaqAccordionCompound.Root>
      {items.map((item, idx) => (
        <FaqAccordionCompound.Item key={idx} index={idx} question={item.q} answer={item.a} />
      ))}
    </FaqAccordionCompound.Root>
  );
}
