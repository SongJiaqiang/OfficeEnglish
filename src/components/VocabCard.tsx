import React, { useState } from 'react';
import { VocabItem } from '../types';
import { Volume2, VolumeX, Check, Copy } from 'lucide-react';
import { AudioEngine } from '../utils/speech';

interface VocabCardProps {
  item: VocabItem;
  index: number;
  onToggleMastered: (id: string) => void;
}

export const VocabCard: React.FC<VocabCardProps> = ({
  item,
  index,
  onToggleMastered,
}) => {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePlayWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingWord) {
      AudioEngine.stop();
      setIsPlayingWord(false);
      return;
    }
    setIsPlayingWord(true);
    setIsPlayingExample(false);
    AudioEngine.speak(item.term, {
      onEnd: () => setIsPlayingWord(false),
      onError: () => setIsPlayingWord(false),
    });
  };

  const handlePlayExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingExample) {
      AudioEngine.stop();
      setIsPlayingExample(false);
      return;
    }
    setIsPlayingExample(true);
    setIsPlayingWord(false);
    AudioEngine.speak(item.example, {
      onEnd: () => setIsPlayingExample(false),
      onError: () => setIsPlayingExample(false),
    });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${item.term} ${item.phonetic} ${item.meaningZh}\nMean: ${item.meaningEn}\nExample: ${item.example}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight the term inside the example sentence
  const highlightExample = (sentence: string, term: string) => {
    if (!term || !sentence) return sentence;
    const cleanTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${cleanTerm})`, 'gi');
    const parts = sentence.split(regex);

    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return (
          <mark
            key={i}
            className="bg-amber-100 text-amber-950 font-semibold px-1 py-0.5 rounded border border-amber-200"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const indexFormatted = (index + 1).toString().padStart(2, '0');

  return (
    <article
      className={`group relative bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        item.isMastered
          ? 'border-emerald-200/90 bg-emerald-50/20'
          : 'border-stone-200/90 hover:border-stone-300'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top row: Index, Term, IPA, and Actions */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-xs font-semibold text-stone-400 tabular-nums">
              {indexFormatted}.
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {item.term}
            </h3>

            {item.phonetic && (
              <span className="font-mono text-xs sm:text-sm text-stone-500 font-normal">
                {item.phonetic}
              </span>
            )}

            <button
              onClick={handlePlayWord}
              aria-label={`Pronounce ${item.term}`}
              className={`p-1.5 rounded-full transition-colors ${
                isPlayingWord
                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="Pronounce word"
            >
              {isPlayingWord ? (
                <VolumeX className="w-4 h-4 text-amber-800" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category text if available (unboxed metadata with dot separator) */}
            {item.category && (
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                {item.category}
                <span className="mx-1.5 opacity-50" aria-hidden="true">·</span>
              </span>
            )}

            {/* Chinese definition */}
            <span className="font-sans text-sm font-semibold text-amber-900 bg-amber-50/80 px-2.5 py-0.5 rounded border border-amber-200/60">
              {item.meaningZh}
            </span>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
              title="Copy entry"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Mastered toggle button */}
            <button
              onClick={() => onToggleMastered(item.id)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                item.isMastered
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title={item.isMastered ? 'Marked as mastered' : 'Mark as mastered'}
            >
              <Check className={`w-3.5 h-3.5 ${item.isMastered ? 'text-emerald-700' : 'text-stone-400'}`} />
              <span className="hidden md:inline">{item.isMastered ? 'Mastered' : 'Mark'}</span>
            </button>
          </div>
        </div>

        {/* English Explanation / Definition */}
        <div className="mt-3.5">
          <div className="text-sm sm:text-[15px] leading-relaxed text-stone-800">
            <span className="font-semibold text-stone-900 mr-1.5">Mean:</span>
            {item.meaningEn}
          </div>
        </div>

        {/* Office Context Example */}
        {item.example && (
          <div className="mt-4 p-3.5 bg-stone-50 rounded-lg border border-stone-200/70 text-stone-700">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Office Context & Usage
                </span>
                <p className="font-serif italic text-sm sm:text-base leading-relaxed text-stone-800">
                  “{highlightExample(item.example, item.term)}”
                </p>
              </div>

              <button
                onClick={handlePlayExample}
                aria-label="Listen to example sentence"
                className={`p-1.5 mt-0.5 rounded-full shrink-0 transition-colors ${
                  isPlayingExample
                    ? 'bg-amber-100 text-amber-900 animate-pulse'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200/60'
                }`}
                title="Listen to full sentence"
              >
                {isPlayingExample ? (
                  <VolumeX className="w-4 h-4 text-amber-800" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
