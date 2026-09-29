import React, { useState, useMemo } from 'react';
import { VocabPost, VocabItem } from '../types';
import { CheckCircle2, XCircle, RefreshCw, ArrowLeft, Trophy, Sparkles } from 'lucide-react';

interface QuizModeProps {
  post: VocabPost;
  onBackToCard: () => void;
  onToggleMastered: (id: string) => void;
}

interface Question {
  id: string;
  type: 'meaning' | 'scenario';
  prompt: string;
  targetItem: VocabItem;
  options: VocabItem[];
}

export const QuizMode: React.FC<QuizModeProps> = ({
  post,
  onBackToCard,
  onToggleMastered,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate 5 questions from the 5 items
  const questions: Question[] = useMemo(() => {
    return post.items.map((item, index) => {
      // 3 distractors
      const otherItems = post.items.filter((i) => i.id !== item.id);
      const shuffledOthers = [...otherItems].sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [...shuffledOthers, item].sort(() => Math.random() - 0.5);

      if (index % 2 === 0) {
        return {
          id: `q-${index}`,
          type: 'meaning',
          prompt: `Which office vocabulary means: "${item.meaningEn}" (${item.meaningZh})?`,
          targetItem: item,
          options: allOptions,
        };
      } else {
        // Scenario fill-in-the-blank
        const blankedExample = item.example.replace(
          new RegExp(item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          '[ ______ ]'
        );
        return {
          id: `q-${index}`,
          type: 'scenario',
          prompt: `Fill in the missing office term: "${blankedExample}"`,
          targetItem: item,
          options: allOptions,
        };
      }
    });
  }, [post]);

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (option: VocabItem) => {
    if (isAnswered) return;
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const isCorrect = option.id === currentQ.targetItem.id;
    if (isCorrect) {
      setScore((s) => s + 1);
      // Auto-master if answered correctly
      if (!currentQ.targetItem.isMastered) {
        onToggleMastered(currentQ.targetItem.id);
      }
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-amber-800">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Quiz Completed!
          </h2>
          <p className="mt-1 text-stone-500 text-sm">
            {post.title} · Issue #{post.issueNumber}
          </p>
        </div>

        <div className="p-6 bg-stone-50 rounded-xl border border-stone-100">
          <div className="font-mono text-4xl font-bold text-stone-900 tabular-nums">
            {score} / {questions.length}
          </div>
          <div className="text-sm font-semibold text-stone-600 mt-1">
            {percentage}% Mastery Score
          </div>
          <p className="text-xs text-stone-500 mt-2">
            {percentage === 100
              ? 'Flawless recall! You have completely mastered all 5 vocabularies in this issue.'
              : 'Great practice! Review the missed terms in Flashcards mode.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={onBackToCard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Post Card</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCard}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Post Card</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 tabular-nums">
          <span>Question {currentQIndex + 1} of {questions.length}</span>
          <span aria-hidden="true">·</span>
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-stone-900 transition-all duration-300"
          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block mb-3">
            {currentQ.type === 'scenario' ? 'Office Context Match' : 'Definition Match'}
          </span>
          <h2 className="text-lg sm:text-xl font-medium text-stone-900 leading-relaxed font-serif">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isTarget = option.id === currentQ.targetItem.id;

            let buttonStyle = 'border-stone-200 hover:border-stone-400 bg-stone-50/60 hover:bg-stone-100 text-stone-800';

            if (isAnswered) {
              if (isTarget) {
                buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
              } else if (isSelected && !isTarget) {
                buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950';
              } else {
                buttonStyle = 'border-stone-100 bg-stone-50 text-stone-400 opacity-60';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-stone-400 tabular-nums">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <div>
                    <div className="font-bold text-base text-stone-900">
                      {option.term}
                    </div>
                    <div className="text-xs text-stone-500 font-normal">
                      {option.meaningZh} {option.phonetic}
                    </div>
                  </div>
                </div>

                {isAnswered && isTarget && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isTarget && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer explanation footer */}
        {isAnswered && (
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600">
              <span className="font-semibold text-stone-900">{currentQ.targetItem.term}:</span> {currentQ.targetItem.meaningEn}
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors shrink-0 shadow-xs"
            >
              {currentQIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
