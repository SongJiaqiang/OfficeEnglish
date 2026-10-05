import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { VocabPost, ViewMode } from './types';
import { INITIAL_POSTS } from './data/initialPosts';
import { Header } from './components/Header';
import { DailyPostCard } from './components/DailyPostCard';
import { FlashcardStudy } from './components/FlashcardStudy';
import { QuizMode } from './components/QuizMode';
import { UploadModal } from './components/UploadModal';
import { ShareCardModal } from './components/ShareCardModal';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import heroImage from './assets/images/office_editorial_desk_1790523820734.jpg';

const STORAGE_KEY = 'lexicon_office_posts_v1';

// Keep saved progress, and insert any seeded issues the browser has not seen yet.
function withNewSeedPosts(stored: VocabPost[]): VocabPost[] {
  const storedIds = new Set(stored.map((post) => post.id));
  const missing = INITIAL_POSTS.filter((post) => !storedIds.has(post.id));
  if (missing.length === 0) return stored;
  return [...missing, ...stored].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export default function App() {
  const [posts, setPosts] = useState<VocabPost[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return withNewSeedPosts(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load posts from storage:', e);
    }
    return INITIAL_POSTS;
  });

  const [activePostId, setActivePostId] = useState<string>('post-19');
  const [currentMode, setCurrentMode] = useState<ViewMode>('card');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save posts to storage:', e);
    }
  }, [posts]);

  // Current active post
  const activePost = posts.find((p) => p.id === activePostId) || posts[0];
  const activeIndex = posts.findIndex((p) => p.id === activePost?.id);

  // Prev / Next post handlers
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < posts.length - 1;

  const handlePrevPost = () => {
    if (hasPrev) {
      setActivePostId(posts[activeIndex - 1].id);
    }
  };

  const handleNextPost = () => {
    if (hasNext) {
      setActivePostId(posts[activeIndex + 1].id);
    }
  };

  // Toggle mastered status for an item
  const handleToggleMastered = (itemId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const hasItem = post.items.some((i) => i.id === itemId);
        if (!hasItem) return post;

        return {
          ...post,
          items: post.items.map((i) =>
            i.id === itemId ? { ...i, isMastered: !i.isMastered } : i
          ),
        };
      })
    );
  };

  // Save new post from upload modal
  const handleSaveNewPost = (newPost: VocabPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setActivePostId(newPost.id);
    setCurrentMode('card');
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => {
      const remaining = prev.filter((p) => p.id !== postId);
      if (activePostId === postId && remaining.length > 0) {
        setActivePostId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Determine next issue number suggestion
  const nextIssueNumber =
    posts.reduce((max, p) => {
      const num = parseInt(String(p.issueNumber).replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0) + 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 selection:bg-amber-200">
      {/* Top Bar Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenArchive={() => setIsArchiveOpen(true)}
        totalPosts={posts.length}
      />

      {/* Hero Welcome / Curatorial Banner */}
      <section className="border-b border-stone-200/70 bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-900 font-semibold tracking-wider uppercase">
              <span>Silicon Valley & Global Tech English</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Daily Curated 5 Terms</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Master the Unwritten Vocabulary of High-Growth Tech & Modern Work
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every day, learn 5 authentic expressions with native IPA pronunciation, Chinese definitions, exact office nuance, and real-world conversation examples.
            </p>
          </div>

          {/* Editorial Banner Thumbnail with Fallback */}
          <div className="relative w-full md:w-56 h-28 rounded-xl overflow-hidden shadow-xs border border-stone-300/80 shrink-0 bg-stone-100">
            <img
              src={heroImage}
              alt="Executive editorial study desk with notebook and fountain pen"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Zero-broken-image fallback: hide image and show elegant fallback styling
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent flex items-end p-2.5">
              <span className="text-white text-[11px] font-medium font-serif italic">
                Daily Focus: 5 Words a Day
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {currentMode === 'card' && activePost && (
          <DailyPostCard
            post={activePost}
            onToggleMastered={handleToggleMastered}
            onSelectMode={setCurrentMode}
            onOpenShareModal={() => setIsShareOpen(true)}
            onPrevPost={handlePrevPost}
            onNextPost={handleNextPost}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        )}

        {currentMode === 'flashcards' && activePost && (
          <FlashcardStudy
            post={activePost}
            onToggleMastered={handleToggleMastered}
            onBackToCard={() => setCurrentMode('card')}
          />
        )}

        {currentMode === 'quiz' && activePost && (
          <QuizMode
            post={activePost}
            onBackToCard={() => setCurrentMode('card')}
            onToggleMastered={handleToggleMastered}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-8 px-4 sm:px-6 text-stone-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">Lexicon Office</span>
            <span>·</span>
            <span>Curated Workplace & Tech English</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hover:text-stone-900 transition-colors"
            >
              Upload Post
            </button>
            <span>·</span>
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="hover:text-stone-900 transition-colors"
            >
              Browse Issues ({posts.length})
            </button>
            <span>·</span>
            <span>Pronunciation via Web Speech API</span>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSavePost={handleSaveNewPost}
        nextIssueNumber={nextIssueNumber}
      />

      {activePost && (
        <ShareCardModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={activePost}
        />
      )}

      <ArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        posts={posts}
        activePostId={activePost?.id || ''}
        onSelectPost={setActivePostId}
        onDeletePost={handleDeletePost}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
