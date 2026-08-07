import { SummaryResult } from '@/types';

export async function summarizeWithGemini(text: string): Promise<SummaryResult> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Özet oluşturulurken sunucu tarafında bir hata oluştu.');
  }

  return json.data as SummaryResult;
}

export async function askQuestionAboutText(
  originalText: string,
  summary: string,
  question: string
): Promise<string> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalText, summary, question }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Soru yanıtlanırken sunucu tarafında bir hata oluştu.');
  }

  return json.answer as string;
}
