import React from 'react';
import { StoryType } from '../types';
import { storySectionTitle } from '../utils/lesson';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightTerms(text: string, terms: string[]): React.ReactNode[] {
  const unique = [...new Set(terms.map((term) => term.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!text || unique.length === 0) return [text];

  const pattern = unique.map(escapeRegExp).join('|');
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'));

  return parts.map((part, index) => {
    const matched = unique.some((term) => term.toLowerCase() === part.toLowerCase());
    if (!matched) return part;
    return (
      <mark
        key={`${part}-${index}`}
        className="bg-amber-100 text-amber-950 font-semibold px-1 py-0.5 rounded border border-amber-200"
      >
        {part}
      </mark>
    );
  });
}

function splitScene(scene: string) {
  const match = scene.match(/^(.*?)(\s+[\u4e00-\u9fff].*)$/);
  if (!match) return { english: scene.trim(), chinese: '' };
  return { english: match[1].trim(), chinese: match[2].trim() };
}

interface SceneDialogueProps {
  scene?: string;
  story?: string;
  storyType?: StoryType;
  practicePrompt?: string;
  terms: string[];
}

export const SceneDialogue: React.FC<SceneDialogueProps> = ({
  scene,
  story,
  storyType,
  practicePrompt,
  terms,
}) => {
  if (!scene && !story && !practicePrompt) return null;

  const sceneParts = scene ? splitScene(scene) : null;
  const storyLabel = storySectionTitle(storyType);
  const lines = story ? story.split(/\r?\n/).filter((line) => line.trim()) : [];

  return (
    <section className="mt-8 space-y-4" aria-label="Scene and dialogue">
      {sceneParts && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Scene</h2>
          <p className="mt-2 font-serif text-base sm:text-lg leading-relaxed text-stone-900">
            {sceneParts.english}
          </p>
          {sceneParts.chinese && (
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{sceneParts.chinese}</p>
          )}
        </div>
      )}

      {story && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{storyLabel}</h2>
          <div className="mt-3 space-y-2.5">
            {lines.map((line, index) => {
              const speaker = storyType === 'dialogue'
                ? line.match(/^([A-Za-z][A-Za-z .'-]{0,40}):\s*(.*)$/)
                : null;

              if (speaker) {
                return (
                  <p key={index} className="font-serif text-sm sm:text-base leading-relaxed text-stone-800">
                    <span className="font-sans font-semibold text-stone-900">{speaker[1]}:</span>{' '}
                    {highlightTerms(speaker[2], terms)}
                  </p>
                );
              }

              return (
                <p key={index} className="font-serif text-sm sm:text-base leading-relaxed text-stone-800">
                  {highlightTerms(line, terms)}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {practicePrompt && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Practice</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-800 whitespace-pre-line">{practicePrompt}</p>
        </div>
      )}
    </section>
  );
};
