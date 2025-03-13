'use client';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';

const DEFAULT_VIDEO_URL = 'https://vimeo.com/115783408';

const VideoPlayer = ({ url, onUpdateProgress = () => null, ...restProps }) => {
  const [targetVideoURL, setTargetVideoURL] = useState(() => url);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);

  const handleProgress = state => {
    const currentTime = state.playedSeconds;

    // Check if 15 seconds have passed since the last update
    if (currentTime - lastTrackedTime >= 15) {
      onUpdateProgress(currentTime);
      setLastTrackedTime(currentTime);
    }
  };

  const handleVideoLoadError = () => {
    toast.info('Due to some technical issues actual video cannot be loaded at the moment. Try again later');
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
