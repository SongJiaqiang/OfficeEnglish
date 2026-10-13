import React, { useState } from 'react';
import { Languages } from 'lucide-react';

interface TranslationIconButtonProps {
  pressed: boolean;
  onClick: () => void;
}

export const TranslationIconButton: React.FC<TranslationIconButtonProps> = ({
  pressed,
  onClick,
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    aria-pressed={pressed}
    aria-label={pressed ? 'Hide Chinese translation' : 'Show Chinese translation'}
    title={pressed ? 'Hide translation' : 'Show translation'}
    className={`p-1.5 rounded-md transition-colors shrink-0 ${
      pressed
        ? 'bg-amber-100 text-amber-900'
        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
    }`}
  >
    <Languages className="w-4 h-4" />
  </button>
);

export const TranslationToggle: React.FC<{ text?: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  if (!text?.trim()) return null;

  return (
    <span className="inline-flex items-center gap-1.5 max-w-full">
      <TranslationIconButton pressed={visible} onClick={() => setVisible((open) => !open)} />
      {visible && (
        <span className="font-sans text-sm font-semibold text-amber-900 bg-amber-50/80 px-2.5 py-0.5 rounded border border-amber-200/60">
          {text}
        </span>
      )}
    </span>
  );
};
