import { INITIAL_POSTS } from '../data/initialPosts';
import { VocabItem, VocabPost } from '../types';
import { optionalText, parseStoryType } from '../utils/lesson';
import { formatDateString } from '../utils/parser';
import { createSupabaseClient, isSupabaseConfigured } from './supabase';

const MASTERED_KEY = 'devlingo_mastered_vocab_ids';
const LEGACY_POSTS_KEY = 'lexicon_office_posts_v1';

interface VocabRow {
  id: string;
  term: string;
  phonetic: string;
  meaning_zh: string;
  meaning_en: string;
  example: string;
  category: string | null;
}

interface DailyItemRow {
  position: number;
  vocab_entries: VocabRow | VocabRow[] | null;
}

interface DailyPostRow {
  id: string;
  issue_number: number;
  post_date: string;
  title: string;
  description: string | null;
  scene: string | null;
  story_type: string | null;
  story: string | null;
  practice_prompt: string | null;
  created_at: string;
  daily_post_items: DailyItemRow[] | null;
}

function readStoredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(MASTERED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function readLegacyMasteredTerms(): Set<string> {
  try {
    const raw = localStorage.getItem(LEGACY_POSTS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();

    const terms = new Set<string>();
    for (const post of parsed) {
      if (!post || !Array.isArray(post.items)) continue;
      for (const item of post.items) {
        if (item?.isMastered && typeof item.term === 'string') {
          terms.add(item.term.trim().toLowerCase());
        }
      }
    }
    return terms;
  } catch {
    return new Set();
  }
}

function writeMasteredIds(ids: Set<string>) {
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...ids]));
}

export function masteredIdsFor(posts: VocabPost[]): Set<string> {
  if (localStorage.getItem(MASTERED_KEY) !== null) {
    return readStoredIds();
  }

  const ids = new Set<string>();
  const legacyTerms = readLegacyMasteredTerms();
  for (const post of posts) {
    for (const item of post.items) {
      if (legacyTerms.has(item.term.trim().toLowerCase())) {
        ids.add(item.id);
      }
    }
  }
  writeMasteredIds(ids);
  return ids;
}

export function applyMastery(posts: VocabPost[], masteredIds: Set<string>): VocabPost[] {
  return posts.map((post) => ({
    ...post,
    items: post.items.map((item) => ({
      ...item,
      isMastered: masteredIds.has(item.id),
    })),
  }));
}

export function toggleMasteredId(itemId: string): Set<string> {
  const ids = readStoredIds();
  if (ids.has(itemId)) {
    ids.delete(itemId);
  } else {
    ids.add(itemId);
  }
  writeMasteredIds(ids);
  return ids;
}

function vocabFromRow(row: VocabRow): VocabItem {
  return {
    id: row.id,
    term: row.term,
    phonetic: row.phonetic,
    meaningZh: row.meaning_zh,
    meaningEn: row.meaning_en,
    example: row.example,
    category: row.category ?? undefined,
  };
}

function mapPost(row: DailyPostRow): VocabPost {
  const items = [...(row.daily_post_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .flatMap((item) => {
      const vocab = Array.isArray(item.vocab_entries) ? item.vocab_entries[0] : item.vocab_entries;
      return vocab ? [vocabFromRow(vocab)] : [];
    });

  const scene = optionalText(row.scene);
  const story = optionalText(row.story);
  const practicePrompt = optionalText(row.practice_prompt);
  const storyType = parseStoryType(row.story_type);

  return {
    id: row.id,
    title: row.title,
    issueNumber: row.issue_number,
    date: row.post_date,
    formattedDate: formatDateString(row.post_date),
    description: row.description ?? undefined,
    ...(scene ? { scene } : {}),
    ...(story ? { story } : {}),
    ...(storyType ? { storyType } : {}),
    ...(practicePrompt ? { practicePrompt } : {}),
    items,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function clonePosts(posts: VocabPost[]): VocabPost[] {
  return posts.map((post) => ({
    ...post,
    items: post.items.map((item) => ({ ...item })),
  }));
}

function lessonPreviewRequested(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'lessons';
}

async function loadCatalog(): Promise<VocabPost[]> {
  // Production was shipping without Vite Supabase env vars baked in.
  // Keep the homepage usable from the seeded catalog until keys are set.
  if (!isSupabaseConfigured()) {
    return clonePosts(INITIAL_POSTS);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('daily_posts')
    .select(
      `
      id,
      issue_number,
      post_date,
      title,
      description,
      scene,
      story_type,
      story,
      practice_prompt,
      created_at,
      daily_post_items (
        position,
        vocab_entries (
          id,
          term,
          phonetic,
          meaning_zh,
          meaning_en,
          example,
          category
        )
      )
    `,
    )
    .order('post_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DailyPostRow[]).map(mapPost);
}

export async function loadPosts(): Promise<VocabPost[]> {
  const posts = await loadCatalog();
  // Dev-only samples for the coffee lesson layout. The seeded catalog is unchanged
  // unless this query is present, and the import is dropped from production builds.
  if (import.meta.env.DEV && lessonPreviewRequested()) {
    const { LESSON_PREVIEW_POSTS } = await import('../data/lessonPreviewPosts');
    return [...clonePosts(LESSON_PREVIEW_POSTS), ...posts];
  }
  return posts;
}
