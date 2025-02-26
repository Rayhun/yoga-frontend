'use client';
import { useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, onUpdateProgress = () => null, ...restProps }) => {
  const [lastTrackedTime, setLastTrackedTime] = useState(0);

  const handleProgress = state => {
    const currentTime = state.playedSeconds;

    // Check if 30 seconds have passed since the last update
    if (currentTime - lastTrackedTime >= 30) {
      onUpdateProgress(currentTime);
      setLastTrackedTime(currentTime);
    }
  };
  return (
    <div className="w-full relative pt-[56.25%]">
      <ReactPlayer
        url={url}
        {...restProps}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls
      />
    </div>
  );
};

export default VideoPlayer;
