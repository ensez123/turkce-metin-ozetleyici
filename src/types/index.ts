export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  originalWordCount: number;
  summaryWordCount: number;
  reductionPercentage: number;
  estimatedReadTimeSeconds: number;
}

export interface SampleTextOption {
  id: string;
  title: string;
  category: string;
  text: string;
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}
