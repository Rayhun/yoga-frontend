'use client';
import { useMemo, useState } from 'react';

const ControllableRichText = ({ numberOfWords = 50, children, showFullText = false, ...rest }) => {
  const [isFullTextVisible, setIsFullTextVisible] = useState(false);

  const toggleTextVisibility = () => setIsFullTextVisible(prevState => !prevState);

  // Strip HTML tags for word counting
  const plainText = useMemo(() => {
    if (!children) return '';
    return children.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [children]);

  const totalWords = useMemo(() => plainText.split(' ').filter(word => word.length > 0), [plainText]);

  const truncatedText = useMemo(() => {
    if (totalWords.length <= numberOfWords) return children;
    
    // Find the position in the original HTML where we should truncate
    let wordCount = 0;
    let position = 0;
    let inTag = false;
    
    for (let i = 0; i < children.length && wordCount < numberOfWords; i++) {
      if (children[i] === '<') {
        inTag = true;
      } else if (children[i] === '>') {
        inTag = false;
      } else if (!inTag && children[i] === ' ') {
        wordCount++;
      }
    }
    
    // Find the end of the current word or tag
    while (position < children.length && (children[position] !== ' ' || inTag)) {
      if (children[position] === '<') inTag = true;
      else if (children[position] === '>') inTag = false;
      position++;
    }
    
    return children.substring(0, position);
  }, [children, totalWords, numberOfWords]);

  const hasTruncableText = totalWords.length > numberOfWords;

  // If showFullText is true, always show full text without "See More" button
  if (showFullText) {
    return (
      <div {...rest}>
        <div dangerouslySetInnerHTML={{ __html: children }} />
      </div>
    );
  }

  return (
    <div {...rest}>
      {hasTruncableText ? (
        <>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: isFullTextVisible ? children : truncatedText + '...' 
            }}
          />
          <span className="text-primary cursor-pointer ml-2" onClick={toggleTextVisibility}>
            {isFullTextVisible ? 'See Less' : 'See More'}
          </span>
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: children }} />
      )}
    </div>
  );
};

export default ControllableRichText;
