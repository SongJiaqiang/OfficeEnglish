import React, { useState } from 'react';
import { VocabPost } from '../types';
import { X, Search, Calendar, Hash, CheckCircle2, ChevronRight, Trash2, BookOpen } from 'lucide-react';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  posts: VocabPost[];
  activePostId: string;
  onSelectPost: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  posts,
  activePostId,
  onSelectPost,
  onDeletePost,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(term);
    const issueMatch = String(post.issueNumber).toLowerCase().includes(term);
    const itemMatch = post.items.some(
      (item) =>
        item.term.toLowerCase().includes(term) ||
        item.meaningZh.toLowerCase().includes(term) ||
        item.meaningEn.toLowerCase().includes(term)
    );
    return titleMatch || issueMatch || itemMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl border-l border-stone-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-900" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Daily Posts Archive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vocabulary, meaning, or issue..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Post List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs sm:text-sm">
              No matching issues found for "{searchTerm}"
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isActive = post.id === activePostId;
              const masteredCount = post.items.filter((i) => i.isMastered).length;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post.id);
                    onClose();
                  }}
                  className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/20'
                      : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-mono">
                    <span className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Hash className="w-3 h-3" />
                      Issue {post.issueNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.formattedDate || post.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-stone-900 mb-2">
                    {post.title}
                  </h3>

                  {/* 5 words tags summary */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                      >
                        {item.term}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {masteredCount}/{post.items.length} Mastered
                    </span>

                    <div className="flex items-center gap-1 text-stone-500 group-hover:text-stone-900 font-medium">
                      <span>View Card</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Delete button for user uploaded posts */}
                  {onDeletePost && post.id.startsWith('post-') && post.id !== 'post-20' && post.id !== 'post-19' && post.id !== 'post-18' && post.id !== 'post-17' && post.id !== 'post-16' && post.id !== 'post-15' && post.id !== 'post-14' && post.id !== 'post-13' && post.id !== 'post-12' && post.id !== 'post-11' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete Issue ${post.issueNumber}: "${post.title}"?`)) {
                          onDeletePost(post.id);
                        }
                      }}
                      className="absolute top-3 right-3 p-1 text-stone-300 hover:text-rose-600 rounded-md transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
