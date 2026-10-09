import React from 'react';
import { VocabPost } from '../types';
import { parseDialogue, storySectionTitle } from '../utils/lesson';

interface LessonSectionsProps {
  post: VocabPost;
}

const kickerClass =
  'font-mono text-xs font-semibold uppercase tracking-wider text-amber-900';

export function hasLessonContent(post: VocabPost): boolean {
  return Boolean(post.scene || post.story || post.practicePrompt);
}

export const LessonSections: React.FC<LessonSectionsProps> = ({ post }) => {
  if (!hasLessonContent(post)) return null;

  const storyTitle = storySectionTitle(post.storyType);

  return (
    <div className="mb-6 space-y-6 border-b border-stone-200 pb-6">
      {post.scene && (
        <section aria-labelledby="lesson-scene-heading">
          <h2 id="lesson-scene-heading" className={kickerClass}>
            Scene
          </h2>
          <p className="mt-2 max-w-3xl border-l-2 border-amber-300 pl-4 font-serif text-base leading-relaxed text-stone-700 whitespace-pre-line sm:text-lg">
            {post.scene}
          </p>
        </section>
      )}

      {post.story && (
        <section aria-labelledby="lesson-story-heading">
          <h2 id="lesson-story-heading" className={kickerClass}>
            {storyTitle}
          </h2>
          <div className="mt-2">
            {post.storyType === 'dialogue' ? (
              <DialogueScript story={post.story} />
            ) : (
              <div className="max-w-3xl rounded-xl border border-stone-200/90 bg-white px-4 py-4 shadow-xs sm:px-5">
                <p className="font-serif text-[15px] leading-relaxed text-stone-800 whitespace-pre-line sm:text-base">
                  {post.story}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {post.practicePrompt && (
        <section aria-labelledby="lesson-practice-heading">
          <div className="max-w-3xl rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3.5 sm:px-5">
            <h2 id="lesson-practice-heading" className={kickerClass}>
              Practice
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-800 whitespace-pre-line sm:text-[15px]">
              {post.practicePrompt}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

const DialogueScript: React.FC<{ story: string }> = ({ story }) => {
  const turns = parseDialogue(story);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-xs">
      <dl className="divide-y divide-stone-100">
        {turns.map((turn, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[8.75rem_minmax(0,1fr)] sm:px-5"
          >
            {turn.speaker ? (
              <dt className="font-serif text-sm font-semibold text-amber-950 sm:pt-0.5">
                {turn.speaker}
                <span className="font-sans font-normal text-stone-300" aria-hidden="true">
                  :
                </span>
              </dt>
            ) : (
              <dt className="sr-only">Narration</dt>
            )}
            <dd
              className={`text-sm leading-relaxed sm:text-[15px] ${
                turn.speaker ? 'text-stone-800' : 'text-stone-600 italic sm:col-start-2'
              }`}
            >
              {turn.text}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
