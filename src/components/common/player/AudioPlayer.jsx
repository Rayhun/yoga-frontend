'use client';
import { useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { FaCirclePlay, FaCirclePause } from 'react-icons/fa6';
import { TbRewindBackward10, TbRewindForward10 } from 'react-icons/tb';

const AudioPlayer = ({ src, size = 150 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const rewind10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const forward10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + 10
      );
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div class="relative">
        <CircularProgress
          variant="determinate"
          value={progress}
          size={size}
          thickness={size / 30}
          className="text-primary/50"
        />
        <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <button onClick={togglePlayPause}>
            <span className="text-primary">
              {isPlaying ? <FaCirclePause size={size / 2} /> : <FaCirclePlay size={size / 2} />}
            </span>
          </button>
        </div>
        <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={handleAudioEnd}></audio>
      </div>
      <div className="mt-5 flex justify-center items-center gap-10">
        <TbRewindBackward10 size={size / 7} className="cursor-pointer" onClick={rewind10} />
        <p className="text-sm text-center min-w-12 text-gray-600 dark:text-white">
          {Math.floor((audioRef.current?.currentTime || 0) / 60)
            .toString()
            .padStart(2, '0')}
          :
          {Math.floor((audioRef.current?.currentTime || 0) % 60)
            .toString()
            .padStart(2, '0')}
        </p>
        <TbRewindForward10 size={size / 7} className="cursor-pointer" onClick={forward10} />
      </div>
    </div>
  );
};

export default AudioPlayer;
