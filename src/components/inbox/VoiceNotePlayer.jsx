'use client';

import { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import {
  formatDuration,
  getPlaybackUrl,
  getVoiceDurationFromUrl,
  mimeTypeForVoiceUrl,
} from './chatMedia';

/** Ensures only one voice note plays at a time across the chat. */
const STOP_OTHERS = 'yoga-voice-note-stop';

const VoiceNotePlayer = ({ url, durationSeconds = 0, isMyMessage = false }) => {
  const audioRef = useRef(null);
  const playerIdRef = useRef(`vn-${Math.random().toString(36).slice(2)}`);
  const taggedDuration = Number(durationSeconds) > 0
    ? Number(durationSeconds)
    : getVoiceDurationFromUrl(url);

  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(taggedDuration);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const playbackUrl = getPlaybackUrl(url);
  const mimeType = mimeTypeForVoiceUrl(url);

  useEffect(() => {
    setDuration(prev => (prev > 0 ? prev : taggedDuration));
  }, [taggedDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    setError('');
    setCurrent(0);
    setIsPlaying(false);
    if (taggedDuration > 0) setDuration(taggedDuration);

    const applyDuration = value => {
      if (Number.isFinite(value) && value > 0 && value !== Infinity) {
        setDuration(prev => (prev > 0 ? prev : value));
      }
    };

    const onTime = () => setCurrent(audio.currentTime || 0);
    const onMeta = () => applyDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrent(0);
      audio.currentTime = 0;
    };
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError('');
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => {
      setIsLoading(false);
      applyDuration(audio.duration);
    };
    const onErr = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Unable to play this voice note');
    };
    const onStopOthers = event => {
      if (event.detail?.id === playerIdRef.current) return;
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrent(0);
      }
    };

    // WebM often reports Infinity until we seek — resolve real length for older notes
    const resolveWebmDuration = () => {
      if (taggedDuration > 0) return;
      if (!Number.isFinite(audio.duration) || audio.duration === Infinity || audio.duration === 0) {
        const onSeeked = () => {
          audio.removeEventListener('timeupdate', onSeeked);
          applyDuration(audio.duration);
          audio.currentTime = 0;
        };
        audio.addEventListener('timeupdate', onSeeked);
        try {
          audio.currentTime = 1e101;
        } catch (_) {
          audio.removeEventListener('timeupdate', onSeeked);
        }
      } else {
        applyDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('loadeddata', resolveWebmDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onErr);
    window.addEventListener(STOP_OTHERS, onStopOthers);

    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('loadeddata', resolveWebmDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onErr);
      window.removeEventListener(STOP_OTHERS, onStopOthers);
    };
  }, [playbackUrl, taggedDuration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    window.dispatchEvent(
      new CustomEvent(STOP_OTHERS, { detail: { id: playerIdRef.current } })
    );

    setError('');
    setIsLoading(true);
    try {
      if (!audio.getAttribute('src') && !audio.querySelector('source')?.src) {
        audio.src = playbackUrl;
      }
      if (audio.error) {
        audio.load();
      }
      await audio.play();
    } catch (err) {
      console.error('Voice note playback failed', err);
      setIsLoading(false);
      setError('Tap again to play');
    }
  };

  // WhatsApp: show total length before play; elapsed while playing / scrubbed
  const displaySeconds =
    isPlaying || current > 0.05 ? current : duration > 0 ? duration : 0;

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const trackClass = isMyMessage ? 'bg-green-700/20' : 'bg-gray-300';
  const fillClass = isMyMessage ? 'bg-green-700' : 'bg-green-600';
  const btnClass = isMyMessage
    ? 'bg-green-700 text-white hover:bg-green-800'
    : 'bg-green-600 text-white hover:bg-green-700';
  const timeClass = isMyMessage ? 'text-green-900/70' : 'text-gray-500';

  return (
    <div className="mb-1 min-w-[200px] max-w-[260px] pr-8 pb-3 select-none">
      <audio ref={audioRef} preload="auto" playsInline>
        <source src={playbackUrl} type={mimeType || undefined} />
      </audio>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95 ${btnClass}`}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading && !isPlaying ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <FaPause size={14} />
          ) : (
            <FaPlay size={14} className="ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0 pt-1">
          <button
            type="button"
            className={`w-full h-1.5 rounded-full overflow-hidden ${trackClass}`}
            onClick={togglePlay}
            aria-label="Play voice note"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-100 ${fillClass}`}
              style={{ width: `${progress}%` }}
            />
          </button>
          {/* WhatsApp-style: duration under the bar on the left */}
          <div className={`mt-1.5 text-[11px] tabular-nums font-medium ${timeClass}`}>
            {formatDuration(displaySeconds)}
          </div>
          {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default VoiceNotePlayer;
