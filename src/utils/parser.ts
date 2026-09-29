import { VocabItem, VocabPost } from '../types';

export function formatDateString(dateStr: string): string {
  const clean = dateStr.trim().replace(/[-/]/g, '');
  if (/^\d{8}$/.test(clean)) {
    const year = clean.substring(0, 4);
    const month = parseInt(clean.substring(4, 6), 10) - 1;
    const day = parseInt(clean.substring(6, 8), 10);
    const d = new Date(Number(year), month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  
  // Attempt standard date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return dateStr;
}

export function parseVocabPostText(rawText: string): Partial<VocabPost> & { parseErrors?: string[] } {
  const errors: string[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());

  let title = 'Five for today';
  let issueNumber: string | number = '1';
  let dateRaw = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const vocabLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const titleMatch = line.match(/^Title:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    const noMatch = line.match(/^(?:No\.|No:|#|Issue:?)\s*([A-Za-z0-9_-]+)/i);
    if (noMatch) {
      issueNumber = noMatch[1].trim();
      continue;
    }

    const dateMatch = line.match(/^Date:\s*(.+)$/i);
    if (dateMatch) {
      dateRaw = dateMatch[1].trim();
      continue;
    }

    // Otherwise, treat as vocabulary entry line
    vocabLines.push(line);
  }

  const items: VocabItem[] = [];

  // Parse each entry line
  for (let i = 0; i < vocabLines.length; i++) {
    const entryText = vocabLines[i];
    try {
      const item = parseSingleVocabLine(entryText, i + 1);
      if (item) {
        items.push(item);
      }
    } catch {
      errors.push(`Could not parse entry: "${entryText.substring(0, 40)}..."`);
    }
  }

  return {
    id: `post-${Date.now()}`,
    title,
    issueNumber,
    date: dateRaw,
    formattedDate: formatDateString(dateRaw),
    items,
    createdAt: Date.now(),
    parseErrors: errors.length > 0 ? errors : undefined,
  };
}

export function parseSingleVocabLine(line: string, index: number): VocabItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Expected pattern:
  // [Term] /[phonetic]/ [Chinese] Mean: [English Explanation] Example: [Example sentence]
  // Allow flexible separators
  
  // 1. Extract Phonetic (enclosed in /.../ or [...])
  let term = '';
  let phonetic = '';
  let rest = '';

  const phoneticMatch = trimmed.match(/^([^/\[]+?)\s*([/\[][^/\]]+[/\]])\s*(.+)$/);
  if (phoneticMatch) {
    term = phoneticMatch[1].trim();
    phonetic = phoneticMatch[2].trim();
    rest = phoneticMatch[3].trim();
  } else {
    // If no explicit phonetic found, split by first Chinese character or punctuation
    const chineseMatch = trimmed.match(/^([a-zA-Z0-9\s'.-]+?)\s*([\u4e00-\u9fa5].+)$/);
    if (chineseMatch) {
      term = chineseMatch[1].trim();
      rest = chineseMatch[2].trim();
    } else {
      term = trimmed.split(/[:\s]/)[0] || `Word ${index}`;
      rest = trimmed.substring(term.length).trim();
    }
  }

  // 2. Extract Example:
  let example = '';
  let beforeExample = rest;
  const exampleMatch = rest.match(/(?:Example|Ex):\s*(.+)$/i);
  if (exampleMatch) {
    example = exampleMatch[1].trim();
    beforeExample = rest.substring(0, exampleMatch.index).trim();
  }

  // 3. Extract Mean: (English meaning) and Chinese meaning
  let meaningZh = '';
  let meaningEn = '';

  const meanMatch = beforeExample.match(/(?:Mean|Meaning):\s*(.+)$/i);
  if (meanMatch) {
    meaningEn = meanMatch[1].trim();
    meaningZh = beforeExample.substring(0, meanMatch.index).trim();
  } else {
    // Check if there is Chinese text followed by English text
    const zhSplit = beforeExample.match(/^([\u4e00-\u9fa5\s/()、，]+)(.*)$/);
    if (zhSplit && zhSplit[2].trim()) {
      meaningZh = zhSplit[1].trim();
      meaningEn = zhSplit[2].trim();
    } else {
      meaningZh = beforeExample;
      meaningEn = beforeExample;
    }
  }

  // Clean up any remaining prefix numbers like "1. ", "01. "
  term = term.replace(/^\d+[\.\)\s]+/, '').trim();

  // Infer automatic category
  const category = inferCategory(term, meaningEn, example);

  return {
    id: `item-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    term,
    phonetic,
    meaningZh,
    meaningEn,
    example,
    category,
    isMastered: false,
  };
}

function inferCategory(term: string, mean: string, ex: string): string {
  const combined = `${term} ${mean} ${ex}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('prompt') || combined.includes('repo') || combined.includes('package') || combined.includes('dependency')) {
    return 'Prompt & Dev Rules';
  }
  if (combined.includes('revenue') || combined.includes('churn') || combined.includes('nrr') || combined.includes('metric') || combined.includes('expansion')) {
    return 'B2B SaaS & Metrics';
  }
  if (combined.includes('producer') || combined.includes('queue') || combined.includes('worker') || combined.includes('system') || combined.includes('spof') || combined.includes('box dies') || combined.includes('backpressure')) {
    return 'System & Architecture';
  }
  if (combined.includes('loop') || combined.includes('ticket') || combined.includes('support') || combined.includes('request') || combined.includes('meeting') || combined.includes('sync')) {
    return 'Office Collaboration';
  }
  return 'Workplace Vocabulary';
}

export function serializeVocabPost(post: VocabPost): string {
  const header = `Title: ${post.title}\nNo.${post.issueNumber}\nDate: ${post.date}\n\n`;
  const itemsText = post.items
    .map((item) => {
      const phoneticPart = item.phonetic ? `${item.phonetic} ` : '';
      const zhPart = item.meaningZh ? `${item.meaningZh} ` : '';
      const meanPart = item.meaningEn ? `Mean: ${item.meaningEn} ` : '';
      const exPart = item.example ? `Example: ${item.example}` : '';
      return `${item.term} ${phoneticPart}${zhPart}${meanPart}${exPart}`.trim();
    })
    .join('\n\n');

  return header + itemsText;
}
