'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FaMicrophone, FaPause, FaPlay, FaUser } from 'react-icons/fa';
import {
  formatDuration,
  getPlaybackUrl,
  getVoiceDurationFromUrl,
  mimeTypeForVoiceUrl,
} from './chatMedia';

/** Ensures only one voice note plays at a time across the chat. */
const STOP_OTHERS = 'yoga-voice-note-stop';

const BAR_COUNT = 34;
const PROGRESS_DOT_COLOR = '#C45C00';

const hashSeed = value => {
  let hash = 0;
  const str = String(value || '');
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const buildWaveformBars = seed => {
  const hash = hashSeed(seed);
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    const wave = Math.abs(Math.sin((hash + index * 17) * 0.13) * 10000) % 1;
    return 3 + wave * 13;
  });
};

const VoiceNotePlayer = ({
  url,
  durationSeconds = 0,
  isMyMessage = false,
  messageTime = null,
}) => {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
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
  const barHeights = useMemo(() => buildWaveformBars(url || playbackUrl), [url, playbackUrl]);

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

  const seekToRatio = ratio => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const clamped = Math.min(1, Math.max(0, ratio));
    audio.currentTime = clamped * duration;
    setCurrent(clamped * duration);
  };

  const handleWaveformClick = event => {
    const rect = waveformRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    seekToRatio((event.clientX - rect.left) / rect.width);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const displaySeconds =
    isPlaying || current > 0.05 ? current : duration > 0 ? duration : 0;

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const playedBarCount = Math.round((progress / 100) * BAR_COUNT);
  const labelClass = isMyMessage ? 'text-gray-600' : 'text-gray-500';
  const barPlayedClass = isMyMessage ? 'bg-green-800/55' : 'bg-green-700/50';
  const barUnplayedClass = isMyMessage ? 'bg-green-900/25' : 'bg-gray-400/55';
  const avatarRingClass = isMyMessage ? 'border-green-700/35' : 'border-gray-300';
  const avatarIconClass = isMyMessage ? 'text-green-800' : 'text-green-700';

  return (
    <div className="mb-1 min-w-[230px] max-w-[280px] select-none">
      <audio ref={audioRef} preload="auto" playsInline>
        <source src={playbackUrl} type={mimeType || undefined} />
      </audio>

      <div className="flex items-center gap-2">
        <div className="relative h-11 w-11 flex-shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${avatarRingClass} bg-white/40`}
          >
            <FaUser size={20} className={avatarIconClass} aria-hidden />
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-white ${avatarIconClass}`}
            aria-hidden
          >
            <FaMicrophone size={9} />
          </span>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="flex h-8 w-6 flex-shrink-0 items-center justify-center text-gray-900 transition-transform active:scale-95"
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading && !isPlaying ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent" />
          ) : isPlaying ? (
            <FaPause size={15} />
          ) : (
            <FaPlay size={15} className="ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <button
            ref={waveformRef}
            type="button"
            className="relative flex h-7 w-full items-center gap-[2px] px-0.5"
            onClick={handleWaveformClick}
            aria-label="Seek voice note"
          >
            {barHeights.map((height, index) => (
              <span
                key={index}
                className={`w-[2px] flex-shrink-0 rounded-full transition-colors duration-100 ${
                  index < playedBarCount ? barPlayedClass : barUnplayedClass
                }`}
                style={{ height: `${height}px` }}
              />
            ))}
            <span
              className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
              style={{
                left: `${progress}%`,
                backgroundColor: PROGRESS_DOT_COLOR,
              }}
            />
          </button>

          <div className={`mt-0.5 flex items-center justify-between text-[11px] tabular-nums ${labelClass}`}>
            <span className="font-medium">{formatDuration(displaySeconds)}</span>
            {messageTime && (
              <span className="text-[10px]">{dayjs(messageTime).format('h:mm A')}</span>
            )}
          </div>

          {error && <p className="mt-0.5 text-[10px] text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default VoiceNotePlayer;
