import React, { useState, useEffect } from 'react';
import { VocabPost, CardTheme } from '../types';
import { generateCardImage } from '../utils/canvasExport';
import { X, Download, Copy, Check, Palette, Sparkles, Loader2 } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: VocabPost;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [theme, setTheme] = useState<CardTheme>('editorial');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsRendering(true);

    generateCardImage(post, { theme })
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error('Error generating card image:', err);
        if (isMounted) setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, post, theme]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `lexicon_office_issue_${post.issueNumber}_${post.date}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      // Fallback: download if clipboard item image is blocked in browser
      handleDownload();
    }
  };

  const handleCopyMarkdown = () => {
    const md = `### 📘 Dev Lingo · Issue #${post.issueNumber} (${post.formattedDate || post.date})
**${post.title}**

${post.items
  .map(
    (item, idx) =>
      `**${idx + 1}. ${item.term}** \`${item.phonetic}\` — *${item.meaningZh}*\n> **Mean:** ${item.meaningEn}\n> **Office Context:** "${item.example}"`
  )
  .join('\n\n')}

*Generated with Dev Lingo*`;

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 rounded-lg text-amber-900">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Share Daily 5 Vocabulary Card
              </h2>
              <p className="text-xs text-stone-500">
                Export high-resolution editorial card for Slack, Notion, or team memos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Selector Toolbar */}
        <div className="px-6 py-3 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Palette className="w-3.5 h-3.5" />
            <span>Card Theme:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme('editorial')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                theme === 'editorial'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Warm Archival
            </button>
            <button
              onClick={() => setTheme('executive')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                theme === 'executive'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Executive Slate
            </button>
            <button
              onClick={() => setTheme('parchment')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                theme === 'parchment'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Parchment
            </button>
          </div>
        </div>

        {/* Card Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-stone-200/50 min-h-[300px]">
          {isRendering ? (
            <div className="flex flex-col items-center gap-2 text-stone-500 text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
              <span>Rendering high-res card...</span>
            </div>
          ) : imageUrl ? (
            <div className="max-w-md w-full rounded-xl overflow-hidden shadow-lg border border-stone-300">
              <img
                src={imageUrl}
                alt={`Dev Lingo Issue ${post.issueNumber}`}
                className="w-full h-auto object-contain block"
              />
            </div>
          ) : (
            <div className="text-stone-500 text-sm">Failed to generate image.</div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            title="Copy as formatted Markdown"
          >
            {copiedMd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMd ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyImage}
              disabled={!imageUrl}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedImage ? 'Image Copied!' : 'Copy Card Image'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!imageUrl}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
