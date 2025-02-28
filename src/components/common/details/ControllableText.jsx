'use client';
import { useMemo, useState } from 'react';

const ControllableText = ({ numberOfWords = 50, children, ...rest }) => {
  const [isFullTextVisible, setIsFullTextVisible] = useState(false);

  const toggleTextVisibility = () => setIsFullTextVisible(prevState => !prevState);

  const truncatedText = useMemo(
    () => children.split(' ').slice(0, numberOfWords).join(' '),
    [children, numberOfWords]
  );

  return (
    <p {...rest}>
      <span>{isFullTextVisible ? children : truncatedText + '...'}</span>
      <span className="text-primary cursor-pointer ml-2" onClick={toggleTextVisibility}>
        {isFullTextVisible ? 'See Less' : 'See More'}
      </span>
    </p>
  );
};

export default ControllableText;
