'use client';
import { useState } from 'react';
import ReactPlayer from 'react-player';

const YouTubeStyleAudioPlayer = ({ url, thumbnail, title, onUpdateProgress = () => null, ...restProps }) => {
  const [lastTrackedTime, setLastTrackedTime] = useState(0);

  const handleProgress = state => {
    const currentTime = state.playedSeconds;

    // Check if 15 seconds have passed since the last update
    if (currentTime - lastTrackedTime >= 15) {
      onUpdateProgress(currentTime);
      setLastTrackedTime(currentTime);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      {/* Thumbnail Section */}
      <div className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }}>
        {/* Overlay for Title */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h2 className="text-white text-2xl font-bold text-center">{title}</h2>
        </div>
      </div>

      {/* Audio Player Section */}
      <div className="px-4 py-2 bg-[#f0f4f8]">
        <ReactPlayer
          {...restProps}
          url={url}
          controls
          width="100%"
          height="50px"
          onProgress={handleProgress}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default YouTubeStyleAudioPlayer;
