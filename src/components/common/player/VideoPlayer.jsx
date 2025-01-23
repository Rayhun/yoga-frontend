'use client';
import { useEffect, useRef, useState } from 'react';
import Vimeo from '@u-wave/react-vimeo';

const VideoPlayer = props => {
  const wrapperRef = useRef(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        const parentWidth = wrapperRef.current.getBoundingClientRect().width;
        setWrapperWidth(parentWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      {wrapperWidth ? <Vimeo {...props} width={wrapperWidth} /> : null}
    </div>
  );
};

export default VideoPlayer;
