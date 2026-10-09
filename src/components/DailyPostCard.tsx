import React, { useState } from 'react';
import { VocabPost, ViewMode } from '../types';
import { LessonSections } from './LessonSections';
import { VocabCard } from './VocabCard';
import {
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Calendar,
  Hash,
} from 'lucide-react';
import { AudioEngine } from '../utils/speech';
import { serializeVocabPost } from '../utils/parser';

interface DailyPostCardProps {
  post: VocabPost;
  onToggleMastered: (itemId: string) => void;
  onSelectMode: (mode: ViewMode) => void;
  onOpenShareModal: () => void;
  onPrevPost?: () => void;
  onNextPost?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const DailyPostCard: React.FC<DailyPostCardProps> = ({
  post,
  onToggleMastered,
  onSelectMode,
  onOpenShareModal,
  onPrevPost,
  onNextPost,
  hasPrev,
  hasNext,
}) => {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const masteredCount = post.items.filter((i) => i.isMastered).length;
  const progressPercent = Math.round((masteredCount / Math.max(1, post.items.length)) * 100);

  // Play through all 5 items sequentially
  const handlePlayAll = () => {
    if (isPlayingAll) {
      AudioEngine.stop();
      setIsPlayingAll(false);
      return;
    }

    setIsPlayingAll(true);
    let index = 0;

    const playNext = () => {
      if (index >= post.items.length) {
        setIsPlayingAll(false);
        return;
      }

      const item = post.items[index];
      index++;

      // Speak word, then short pause, then example
      AudioEngine.speak(`${item.term}. ${item.meaningEn}. Example: ${item.example}`, {
        rate: 0.95,
        onEnd: () => {
          setTimeout(playNext, 800);
        },
        onError: () => {
          setIsPlayingAll(false);
        },
      });
    };

    playNext();
  };

  const handleCopyRaw = () => {
    const raw = serializeVocabPost(post);
    navigator.clipboard.writeText(raw);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Issue Navigation & Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevPost}
            disabled={!hasPrev}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous issue"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNextPost}
            disabled={!hasNext}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next issue"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mastered progress metric */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stone-500">
            {masteredCount} of {post.items.length} Mastered
          </span>
          <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* The Master Post Card */}
      <main className="bg-[#FAF8F5] border border-stone-300/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative watermark-free corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent pointer-events-none rounded-tr-2xl" />

        {/* Masthead Header */}
        <header className="border-b border-stone-200 pb-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wider text-stone-500 font-mono mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-amber-900 font-semibold bg-amber-100/80 px-2 py-0.5 rounded">
                <Hash className="w-3 h-3" />
                Issue {post.issueNumber}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.formattedDate || post.date}
              </span>
            </div>

            <div className="text-stone-400 font-sans normal-case tracking-normal">
              Curated Office Terminology
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {post.description}
                </p>
              )}
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePlayAll}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isPlayingAll
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
                title="Listen to full daily post sequentially"
              >
                {isPlayingAll ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play All (5)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
                title="Copy post in upload format"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
                title="Download or share beautiful card image"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            </div>
          </div>
        </header>

        <LessonSections post={post} />

        {/* 5 Vocabulary Cards List */}
        <section aria-label="Vocabulary Cards" className="space-y-4">
          {post.items.map((item, index) => (
            <VocabCard
              key={item.id}
              item={item}
              index={index}
              onToggleMastered={onToggleMastered}
            />
          ))}
        </section>

        {/* Card Footer / Study Modes CTAs */}
        <footer className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-stone-500">
            Tip: Click the speaker icons for US pronunciation practice.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectMode('flashcards')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4 text-stone-600" />
              <span>Study as Flashcards</span>
            </button>

            <button
              onClick={() => onSelectMode('quiz')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors font-semibold"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Test Your Memory</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
