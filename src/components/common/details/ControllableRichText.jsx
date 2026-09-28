'use client';
import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { stripHtmlLinks } from '@/utils/stripHtmlLinks';

// Keep `target` (DOMPurify drops it by default) so existing "open in new tab" links still work.
const SANITIZE_OPTIONS = { ADD_ATTR: ['target'] };

/**
 * Truncates HTML so the first `maxWords` visible words remain (tags ignored for counting).
 * Cuts before the first character of word (maxWords + 1).
 */
function truncateHtmlToWordCount(html, maxWords) {
  if (!html || maxWords <= 0) return html || '';
  let wordCount = 0;
  let i = 0;
  let inTag = false;
  let inWord = false;
  const len = html.length;

  while (i < len) {
    const c = html[i];
    if (c === '<') {
      inTag = true;
      inWord = false;
      i++;
      continue;
    }
    if (c === '>') {
      inTag = false;
      i++;
      continue;
    }
    if (inTag) {
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      inWord = false;
      i++;
      continue;
    }
    if (!inWord) {
      wordCount++;
      if (wordCount > maxWords) {
        return html.substring(0, i);
      }
      inWord = true;
    }
    i++;
  }
  return html;
}

const ControllableRichText = ({
  numberOfWords = 50,
  children,
  showFullText = false,
  disableLinks = false,
  className = '',
  ...rest
}) => {
  const [isFullTextVisible, setIsFullTextVisible] = useState(false);
  // DOMPurify needs a DOM: without one it returns its input unsanitized. So nothing is rendered
  // until mount — server output and the first client render agree (empty), then the sanitized
  // HTML appears. Every caller renders client-fetched data, so there's no SSR content to lose.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTextVisibility = () => setIsFullTextVisible(prevState => !prevState);

  const html = useMemo(() => {
    if (!isMounted) return '';
    const rawHtml = typeof children === 'string' ? children : String(children ?? '');
    const safeHtml = DOMPurify.sanitize(rawHtml, SANITIZE_OPTIONS);
    return disableLinks ? stripHtmlLinks(safeHtml) : safeHtml;
  }, [children, disableLinks, isMounted]);

  const contentClassName = disableLinks
    ? `${className} rich-text-no-links`.trim()
    : className;

  // Strip HTML tags for word counting (used for "should we show toggle")
  const plainText = useMemo(() => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [html]);

  const totalWords = useMemo(() => plainText.split(/\s+/).filter((word) => word.length > 0), [plainText]);

  const truncatedText = useMemo(() => {
    if (totalWords.length <= numberOfWords) return html;
    return truncateHtmlToWordCount(html, numberOfWords);
  }, [html, totalWords.length, numberOfWords]);

  const hasTruncableText = totalWords.length > numberOfWords;

  // If showFullText is true, always show full text without "See More" button
  if (showFullText) {
    return (
      <div className={contentClassName} {...rest}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  return (
    <div className={contentClassName} {...rest}>
      {hasTruncableText ? (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: isFullTextVisible ? html : truncatedText + '...',
            }}
          />
          <span className="text-primary cursor-pointer ml-2" onClick={toggleTextVisibility}>
            {isFullTextVisible ? 'See Less' : 'See More'}
          </span>
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
};

export default ControllableRichText;
