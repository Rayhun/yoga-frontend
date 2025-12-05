'use client';

// Minimal Markdown renderer for headings, lists, and paragraphs
// Supports: ## headings, - unordered lists, 1. ordered lists, paragraphs, and line breaks
export default function Markdown({ content, className = '' }) {
  const html = convertMarkdownToHtml(typeof content === 'string' ? content : '');

  return (
    <div
      className={`max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function convertMarkdownToHtml(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');

  let htmlParts = [];
  let inUl = false;
  let inOl = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      htmlParts.push(`<p class="text-[15px] leading-6 text-gray-800">${paragraph.join('<br/>')}</p>`);
      paragraph = [];
    }
  };

  const closeLists = () => {
    if (inUl) {
      htmlParts.push('</div>');
      inUl = false;
    }
    if (inOl) {
      htmlParts.push('</div>');
      inOl = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === '') {
      flushParagraph();
      closeLists();
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      closeLists();
      const title = line.slice(3).trim();
      const emoji = mapHeadingEmoji(title);
      const emojiPart = emoji ? `${emoji} ` : '';
      htmlParts.push(
        `<h3 class="text-[16px] font-semibold text-gray-900 mt-6 mb-3 tracking-tight">${emojiPart}${escapeHtml(title)}</h3>`
      );
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!inUl) {
        closeLists();
        htmlParts.push('<div class="space-y-2 my-3">');
        inUl = true;
      }
      htmlParts.push(`<div class="text-[15px] leading-6 text-gray-800">${formatInline(ulMatch[1])}</div>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!inOl) {
        closeLists();
        htmlParts.push('<div class="space-y-2 my-3">');
        inOl = true;
      }
      htmlParts.push(`<div class="text-[15px] leading-6 text-gray-800">${formatInline(olMatch[1])}</div>`);
      continue;
    }

    // Default: accumulate paragraph lines
    paragraph.push(formatInline(line));
  }

  flushParagraph();
  closeLists();

  return htmlParts.join('\n');
}

function mapHeadingEmoji(title) {
  const t = title.toLowerCase();
  if (t.includes('benefits')) return '🧘';
  if (t.includes('tips')) return '🌱';
  if (t.includes('space')) return '🏡';
  if (t.includes('motivated') || t.includes('motivation')) return '🔆';
  if (t.includes('diet')) return '🍽️';
  if (t.includes('success')) return '🏆';
  if (t.includes('steps')) return '🧭';
  return '';
}

function formatInline(str) {
  // Escape HTML first
  let s = escapeHtml(str);
  // En dash for double hyphens
  s = s.replaceAll('--', '—');
  // Bold: **text**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1<\/strong>');
  // Italic: *text* or _text_
  s = s.replace(/(^|\s)\*(?!\s)(.+?)\*(?=\s|$)/g, '$1<em class="italic">$2<\/em>');
  s = s.replace(/(^|\s)_(?!\s)(.+?)_(?=\s|$)/g, '$1<em class="italic">$2<\/em>');
  return s;
}


