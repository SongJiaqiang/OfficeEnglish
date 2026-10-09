import { StoryType } from '../types';

const STORY_TYPES: readonly StoryType[] = ['dialogue', 'monologue', 'document'];

export function parseStoryType(value: string | null | undefined): StoryType | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized && (STORY_TYPES as readonly string[]).includes(normalized)) {
    return normalized as StoryType;
  }
  return undefined;
}

export function optionalText(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function storySectionTitle(storyType: StoryType | undefined): string {
  switch (storyType) {
    case 'dialogue':
      return 'Dialogue';
    case 'monologue':
      return 'Monologue';
    case 'document':
      return 'Document';
    default:
      return 'Story';
  }
}

export interface DialogueTurn {
  speaker?: string;
  text: string;
}

// Speaker names stay short and sit before the first colon. Require whitespace
// after the colon so times and URLs (`10:30`, `https://...`) stay one line.
const SPEAKER_LINE = /^([^:：\n]{1,80})[:：](?:[ \t]+(.*))?$/;

export function parseDialogue(story: string): DialogueTurn[] {
  return story.split(/\r?\n/).flatMap((raw) => {
    if (!raw.trim()) return [];
    const match = raw.match(SPEAKER_LINE);
    const speaker = match?.[1]?.trim();
    if (!match || !speaker) {
      return [{ text: raw.trim() }];
    }
    return [{ speaker, text: match[2] ?? '' }];
  });
}
