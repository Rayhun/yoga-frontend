'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMic } from 'react-icons/fi';
import {
  extensionForMime,
  formatDuration,
  MAX_VOICE_NOTE_BYTES,
  MAX_VOICE_NOTE_SECONDS,
  pickRecorderMimeType,
} from './chatMedia';

const SLIDE_CANCEL_PX = 72;

const VoiceNoteButton = ({ onSendVoice, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [willCancel, setWillCancel] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTsRef = useRef(0);
  const startXRef = useRef(0);
  const cancelledRef = useRef(false);
  const mimeTypeRef = useRef('');
  const isRecordingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopTracks = () => {
    streamRef.current?.getTracks()?.forEach(track => track.stop());
    streamRef.current = null;
  };

  const resetRecorder = () => {
    clearTimer();
    stopTracks();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    isRecordingRef.current = false;
    setIsRecording(false);
    setElapsed(0);
    setWillCancel(false);
  };

  const uploadAndSend = useCallback(
    async (blob, durationSec) => {
      setIsSending(true);
      setError('');
      try {
        const ext = extensionForMime(blob.type);
        const file = new File([blob], `voice-note-${Date.now()}.${ext}`, {
          type: blob.type || `audio/${ext}`,
        });
        await onSendVoice(file, durationSec);
      } catch (err) {
        console.error('Failed to send voice note', err);
        setError('Could not send voice note. Try again.');
      } finally {
        setIsSending(false);
      }
    },
    [onSendVoice]
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      try {
        // Flush any buffered data before stop so the final blob is complete.
        if (typeof recorder.requestData === 'function') {
          recorder.requestData();
        }
      } catch (_) {
        /* ignore */
      }
      recorder.stop();
      return;
    }
    resetRecorder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      try {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (_) {
        /* ignore */
      }
      resetRecorder();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRecording) return undefined;

    const clientX = event =>
      event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX ?? event.clientX ?? startXRef.current;

    const onMove = event => {
      const dx = clientX(event) - startXRef.current;
      const cancel = dx < -SLIDE_CANCEL_PX;
      cancelledRef.current = cancel;
      setWillCancel(cancel);
    };

    const onRelease = () => stopRecording();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onRelease);
    window.addEventListener('touchend', onRelease);
    window.addEventListener('pointerup', onRelease);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onRelease);
      window.removeEventListener('touchend', onRelease);
      window.removeEventListener('pointerup', onRelease);
    };
  }, [isRecording, stopRecording]);

  const startRecording = async event => {
    event.preventDefault();
    if (disabled || isRecordingRef.current || isSending) return;
    setError('');
    cancelledRef.current = false;
    setWillCancel(false);
    startXRef.current =
      event.touches?.[0]?.clientX ?? event.clientX ?? 0;

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Voice notes are not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const wasCancelled = cancelledRef.current;
        clearTimer();
        stopTracks();
        isRecordingRef.current = false;
        setIsRecording(false);
        setWillCancel(false);

        if (wasCancelled) {
          chunksRef.current = [];
          return;
        }

        const blobType = mimeTypeRef.current || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        // Ignore accidental taps shorter than ~0.4s / incomplete blobs
        const durationSec = (Date.now() - startTsRef.current) / 1000;
        if (durationSec < 0.4 || !blob.size) {
          setError('Hold to record a voice note.');
          return;
        }
        // Fragmented/incomplete mp4 blobs are often ~1KB and unplayable
        if (blob.size < 2048) {
          setError('Recording too short. Hold the mic a bit longer.');
          return;
        }
        if (blob.size > MAX_VOICE_NOTE_BYTES) {
          setError('Voice note is too large (max 10MB).');
          return;
        }

        uploadAndSend(blob, durationSec);
      };

      mediaRecorderRef.current = recorder;
      // No timeslice — timesliced audio/mp4 produces unplayable fMP4 fragments (moof-only).
      recorder.start();
      startTsRef.current = Date.now();
      setElapsed(0);
      isRecordingRef.current = true;
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTsRef.current) / 1000);
        setElapsed(secs);
        // Auto-send at max length (90s)
        if (secs >= MAX_VOICE_NOTE_SECONDS) {
          stopRecording();
        }
      }, 250);
    } catch (err) {
      console.error('Microphone access failed', err);
      stopTracks();
      setError('Microphone permission is required for voice notes.');
    }
  };

  if (isRecording) {
    return (
      <div
        className={`flex items-center gap-2 min-w-[180px] select-none px-2 py-1 rounded-full ${
          willCancel ? 'bg-red-50' : 'bg-green-50'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            willCancel ? 'bg-red-500' : 'bg-red-500'
          }`}
        />
        <span
          className={`text-sm font-medium tabular-nums ${
            willCancel ? 'text-red-600' : 'text-red-600'
          }`}
        >
          {formatDuration(elapsed)}
        </span>
        <span className={`text-xs ${willCancel ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          {willCancel
            ? 'Release to cancel'
            : elapsed >= MAX_VOICE_NOTE_SECONDS - 10
              ? `${MAX_VOICE_NOTE_SECONDS - elapsed}s left`
              : '← Slide to cancel'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        disabled={disabled || isSending}
        onMouseDown={startRecording}
        onTouchStart={startRecording}
        onContextMenu={e => e.preventDefault()}
        className="h-8 w-8 flex flex-shrink-0 rounded-full justify-center items-center bg-green-500 text-white hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-none"
        title="Hold to record a voice note"
        aria-label="Hold to record a voice note"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiMic size={16} />
        )}
      </button>
      {error && (
        <div className="absolute bottom-full right-0 mb-2 max-w-[220px] rounded-lg bg-red-600 text-white text-xs px-2 py-1 shadow-lg z-20">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError('')}>
            dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceNoteButton;
