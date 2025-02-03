'use client';
import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause } from 'react-icons/fa6';
import Image from 'next/image';

const YouTubeStyleAudioPlayer = ({ audio, thumbnail, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar change
  const handleSeek = e => {
    const seekTime = (e.target.value / 100) * duration;
    playerRef.current.seekTo(seekTime, 'seconds');
    setProgress(seekTime);
  };

  // Update progress
  const handleProgress = state => {
    setProgress(state.playedSeconds);
  };

  // Format time (seconds to MM:SS)
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-black rounded-xl overflow-hidden shadow-lg">
      {/* Thumbnail as Poster */}
      <div className="relative w-full flex items-center justify-center">
        <Image
          src={thumbnail}
          alt={title}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-full object-cover"
        />
        {/* Play Button */}
        <button
          onClick={togglePlayPause}
          className="absolute bg-white p-6 rounded-full shadow-lg hover:scale-105 transition"
        >
          {isPlaying ? (
            <FaPause size={40} className="text-black" />
          ) : (
            <FaPlay size={40} className="text-black" />
          )}
        </button>
      </div>

      {/* Player Controls */}
      <div className="controls p-4 bg-gray-700 text-white">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 truncate">{title}</h3>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={(progress / duration) * 100 || 0}
            onChange={handleSeek}
            className="flex-1 h-1 bg-secondary appearance-none rounded-full cursor-pointer"
          />
          <span className="text-sm text-secondary">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Hidden ReactPlayer */}
      <ReactPlayer
        ref={playerRef}
        url={audio}
        playing={isPlaying}
        controls={false}
        onProgress={handleProgress}
        onDuration={d => setDuration(d)}
        height={0}
        width={0}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default YouTubeStyleAudioPlayer;
