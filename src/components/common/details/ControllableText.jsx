'use client';
import { useMemo, useState } from 'react';

const ControllableText = ({ numberOfWords = 50, children, ...rest }) => {
  const [isFullTextVisible, setIsFullTextVisible] = useState(false);

  const toggleTextVisibility = () => setIsFullTextVisible(prevState => !prevState);

  const totalWords = useMemo(() => children.split(' '), [children]);

  const truncatedText = useMemo(
    () => totalWords.slice(0, numberOfWords).join(' '),
    [totalWords, numberOfWords]
  );

  const hasTruncableText = totalWords.length > numberOfWords;

  return (
    <p {...rest}>
      {hasTruncableText ? (
        <>
          <span>{isFullTextVisible ? children : truncatedText + '...'}</span>
          <span className="text-primary cursor-pointer ml-2" onClick={toggleTextVisibility}>
            {isFullTextVisible ? 'See Less' : 'See More'}
          </span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </p>
  );
};

export default ControllableText;
