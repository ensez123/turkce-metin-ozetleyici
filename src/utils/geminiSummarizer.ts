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
