'use client';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';

const DEFAULT_VIDEO_URL = 'https://vimeo.com/115783408';
const LOAD_ERROR_MESSAGE = 'Due to some technical issues actual video cannot be loaded at the moment. Try again later';

/**
 * `fallbackOnError` (default true — existing LMS behaviour): on a load error, toast and swap to
 * DEFAULT_VIDEO_URL. Pass `false` to opt out: the toast fires once per mount and the player stays
 * on the original URL (no fallback video, so no error → fallback → error toast loop).
 */
const VideoPlayer = ({ url, onUpdateProgress = () => null, fallbackOnError = true, ...restProps }) => {
  const [targetVideoURL, setTargetVideoURL] = useState(() => url);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const hasReportedErrorRef = useRef(false);

  const handleProgress = state => {
    const currentTime = state.playedSeconds;

    // Check if 15 seconds have passed since the last update
    if (currentTime - lastTrackedTime >= 15) {
      onUpdateProgress(currentTime);
      setLastTrackedTime(currentTime);
    }
  };

  const handleVideoLoadError = () => {
    if (!fallbackOnError) {
      if (hasReportedErrorRef.current) return;
      hasReportedErrorRef.current = true;
      toast.info(LOAD_ERROR_MESSAGE);
      return;
    }
    toast.info(LOAD_ERROR_MESSAGE);
    setTargetVideoURL(DEFAULT_VIDEO_URL);
  };

  return (
    <div className="w-full relative pt-[56.25%]">
      <ReactPlayer
        {...restProps}
        url={targetVideoURL}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls
        onError={handleVideoLoadError}
      />
    </div>
  );
};

export default VideoPlayer;
