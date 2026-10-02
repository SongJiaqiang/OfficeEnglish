import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Layers, CheckCircle2, Archive } from 'lucide-react';

interface HeaderProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  onOpenArchive: () => void;
  totalPosts: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenArchive,
  totalPosts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectMode('card')}
            className="text-left group cursor-pointer"
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Lexicon Office
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links / View Modes */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectMode('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentMode === 'card'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Digest</span>
          </button>

          <button
            onClick={() => onSelectMode('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentMode === 'flashcards'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => onSelectMode('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentMode === 'quiz'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Quick Recall</span>
          </button>

          <button
            onClick={onOpenArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors whitespace-nowrap"
            title="Browse all daily posts"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
            <span className="font-mono text-xs opacity-75 tabular-nums">({totalPosts})</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
