import React, { useState, useEffect } from 'react';
import { VocabPost } from '../types';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Check,
  X,
  Shuffle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { AudioEngine } from '../utils/speech';

interface FlashcardStudyProps {
  post: VocabPost;
  onToggleMastered: (id: string) => void;
  onBackToCard: () => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  post,
  onToggleMastered,
  onBackToCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [deck, setDeck] = useState(post.items);

  useEffect(() => {
    setDeck(post.items);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [post]);

  const currentItem = deck[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      AudioEngine.stop();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    AudioEngine.speak(text, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.length]);

  if (!currentItem) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCard}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Post Card</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs sm:text-sm text-stone-500 tabular-nums">
            Card {currentIndex + 1} of {deck.length}
          </span>
          <button
            onClick={handleShuffle}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2">
        {deck.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-stone-900'
                : item.isMastered
                ? 'w-2 bg-emerald-500'
                : 'w-2 bg-stone-300'
            }`}
            title={`Card ${idx + 1}: ${item.term}`}
          />
        ))}
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-[420px] cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-2xl shadow-md border border-stone-300/80 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 backface-hidden bg-[#FAF8F5] p-8 flex flex-col justify-between rounded-2xl">
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                TERM FRONT
              </span>
              <span>Click or tap anywhere to flip</span>
            </div>

            <div className="my-auto text-center space-y-4">
              <div className="inline-block">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-medium block mb-2">
                  {currentItem.category || 'Office Terminology'}
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
                  {currentItem.term}
                </h2>
              </div>

              {currentItem.phonetic && (
                <div className="font-mono text-base sm:text-lg text-stone-500">
                  {currentItem.phonetic}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={(e) => handlePlayAudio(e, currentItem.term)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-full text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-4 h-4 text-amber-800" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-stone-600" />
                  )}
                  <span>Pronounce Term</span>
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-stone-400">
              [Space] or Click to reveal definition
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white p-8 flex flex-col justify-between rounded-2xl overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-stone-900">
                  {currentItem.term}
                </span>
                <span className="font-mono text-xs text-stone-400">
                  {currentItem.phonetic}
                </span>
              </div>
              <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded text-sm">
                {currentItem.meaningZh}
              </span>
            </div>

            <div className="my-auto space-y-5">
              <div>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                  Definition & Explanation
                </span>
                <p className="text-base sm:text-lg leading-relaxed text-stone-800 font-medium">
                  {currentItem.meaningEn}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Office Context
                  </span>
                  <button
                    onClick={(e) => handlePlayAudio(e, currentItem.example)}
                    className="p-1 text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                    title="Pronounce example sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-serif italic text-sm sm:text-base leading-relaxed text-stone-800">
                  “{currentItem.example}”
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
              <span>Click to flip back</span>
              <span className="flex items-center gap-1 text-stone-600 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                Flip
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleMastered(currentItem.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              currentItem.isMastered
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {currentItem.isMastered ? (
              <>
                <Check className="w-4 h-4" />
                <span>Mastered</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Mark as Mastered</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Helpful keyboard instructions */}
      <div className="text-center text-xs text-stone-400">
        Keyboard Shortcuts: <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">Space</kbd> Flip · <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">←</kbd> Prev · <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">→</kbd> Next
      </div>
    </div>
  );
};
