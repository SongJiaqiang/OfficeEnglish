export interface VocabItem {
  id: string;
  term: string;
  phonetic: string;
  meaningZh: string;
  meaningEn: string;
  example: string;
  category?: string;
  isMastered?: boolean;
}

export interface VocabPost {
  id: string;
  title: string;
  issueNumber: string | number;
  date: string; // ISO date string YYYY-MM-DD or raw YYYYMMDD
  formattedDate: string; // e.g. "Sep 27, 2026"
  description?: string;
  items: VocabItem[];
  createdAt: number;
}

export type ViewMode = 'card' | 'flashcards' | 'quiz';

export type CardTheme = 'editorial' | 'executive' | 'parchment';
