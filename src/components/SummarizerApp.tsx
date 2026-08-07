'use client';

import React from 'react';
import { SummarizerProvider } from './SummarizerContext';
import { SummarizerToast } from './SummarizerToast';
import { SummarizerForm } from './SummarizerForm';
import { SummarizerLoading } from './SummarizerLoading';
import { SummaryResults } from './SummaryResults';
import { QuestionAnswering } from './QuestionAnswering';

// Export Compound Component
export const Summarizer = {
  Provider: SummarizerProvider,
  Toast: SummarizerToast,
  Form: SummarizerForm,
  Loading: SummarizerLoading,
  Results: SummaryResults,
  QuestionAnswering: QuestionAnswering,
};

export function SummarizerApp() {
  return (
    <Summarizer.Provider>
      <Summarizer.Toast />
      <Summarizer.Form />
      <Summarizer.Loading />
      <Summarizer.Results />
      <Summarizer.QuestionAnswering />
    </Summarizer.Provider>
  );
}
