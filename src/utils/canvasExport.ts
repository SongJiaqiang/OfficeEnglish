import { VocabPost, CardTheme } from '../types';

interface RenderOptions {
  theme: CardTheme;
}

export async function generateCardImage(post: VocabPost, options: RenderOptions): Promise<string> {
  const width = 1200;
  // Dynamic height based on content
  const estimatedHeight = 160 + post.items.length * 200 + 100;
  const height = Math.max(1200, estimatedHeight);

  const canvas = document.createElement('canvas');
  const dpr = 2; // Retina sharpness
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(dpr, dpr);

  // Theme colors
  let bg = '#FBF9F5';
  let cardBorder = '#E7E2D7';
  let primaryText = '#1C1917';
  let secondaryText = '#78716C';
  let accentColor = '#9A3412'; // Terracotta
  let itemBg = '#FFFFFF';
  let itemBorder = '#EFECE6';

  if (options.theme === 'executive') {
    bg = '#F8FAFC';
    cardBorder = '#CBD5E1';
    primaryText = '#0F172A';
    secondaryText = '#64748B';
    accentColor = '#0369A1'; // Deep Azure
    itemBg = '#FFFFFF';
    itemBorder = '#E2E8F0';
  } else if (options.theme === 'parchment') {
    bg = '#F5F0E6';
    cardBorder = '#DED4C5';
    primaryText = '#292524';
    secondaryText = '#857F74';
    accentColor = '#B45309'; // Warm Amber
    itemBg = '#FAF7F0';
    itemBorder = '#E9E2D5';
  }

  // Draw background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Outer framing line
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Top Masthead / Issue Banner
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.letterSpacing = '2px';
  ctx.fillText(`DEV LINGO · ISSUE NO. ${post.issueNumber}`, 64, 82);

  ctx.font = '400 13px system-ui, sans-serif';
  ctx.fillStyle = secondaryText;
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  ctx.fillText(post.formattedDate || post.date, width - 64, 82);
  ctx.textAlign = 'left';

  // Title
  ctx.font = '600 36px Georgia, serif';
  ctx.fillStyle = primaryText;
  ctx.fillText(post.title, 64, 130);

  // Subtitle / Kicker
  ctx.font = '400 15px system-ui, sans-serif';
  ctx.fillStyle = secondaryText;
  ctx.fillText('Daily 5 Workplace Terminology & Practical Context', 64, 156);

  // Divider
  ctx.beginPath();
  ctx.moveTo(64, 180);
  ctx.lineTo(width - 64, 180);
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw each vocab item
  let currentY = 210;

  for (let i = 0; i < post.items.length; i++) {
    const item = post.items[i];
    const boxHeight = 175;

    // Item container
    ctx.fillStyle = itemBg;
    ctx.fillRect(64, currentY, width - 128, boxHeight);
    ctx.strokeStyle = itemBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(64, currentY, width - 128, boxHeight);

    // Left index accent bar
    ctx.fillStyle = accentColor;
    ctx.fillRect(64, currentY, 4, boxHeight);

    // Number index (e.g. 01)
    const indexStr = (i + 1).toString().padStart(2, '0');
    ctx.font = '500 13px monospace';
    ctx.fillStyle = secondaryText;
    ctx.fillText(`${indexStr}.`, 84, currentY + 34);

    // Term name
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = primaryText;
    ctx.fillText(item.term, 115, currentY + 34);

    const termWidth = ctx.measureText(item.term).width;

    // Phonetic
    if (item.phonetic) {
      ctx.font = '400 15px monospace';
      ctx.fillStyle = secondaryText;
      ctx.fillText(item.phonetic, 115 + termWidth + 14, currentY + 33);
    }

    // Chinese definition (aligned right or after phonetic)
    if (item.meaningZh) {
      ctx.font = '600 16px system-ui, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'right';
      ctx.fillText(item.meaningZh, width - 88, currentY + 34);
      ctx.textAlign = 'left';
    }

    // English Meaning
    ctx.font = '400 14px system-ui, sans-serif';
    ctx.fillStyle = primaryText;
    const meanText = `Mean: ${item.meaningEn}`;
    wrapText(ctx, meanText, 84, currentY + 68, width - 172, 20, 2);

    // Example Box
    const exBoxY = currentY + 104;
    ctx.fillStyle = options.theme === 'parchment' ? '#F0EADF' : '#F6F4F0';
    if (options.theme === 'executive') ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(84, exBoxY, width - 168, 52);

    ctx.font = 'italic 13.5px Georgia, serif';
    ctx.fillStyle = secondaryText;
    const exampleText = `Example: “${item.example}”`;
    wrapText(ctx, exampleText, 98, exBoxY + 24, width - 200, 19, 2);

    currentY += boxHeight + 16;
  }

  // Footer
  ctx.font = '500 12px system-ui, sans-serif';
  ctx.fillStyle = secondaryText;
  ctx.fillText('DEV LINGO · DAILY WORKPLACE ENGLISH DIGEST', 64, height - 52);

  ctx.textAlign = 'right';
  ctx.fillText('Generated with AI Studio', width - 64, height - 52);

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        // truncate with ellipsis for last line if overflow
        let remaining = words.slice(n).join(' ');
        while (ctx.measureText(remaining + '...').width > maxWidth && remaining.length > 0) {
          remaining = remaining.substring(0, remaining.length - 1);
        }
        ctx.fillText(remaining + '...', x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}
