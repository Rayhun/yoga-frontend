'use client';

import { useEffect, useRef, useState } from 'react';
import { streamAiChatText } from '@/utils/ai-chat-stream';

export default function useStreamText(text, { enabled = true, speed = 30, typingDelayMs = 450 } = {}) {
  const [streamedText, setStreamedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.();
    cancelRef.current = null;

    if (!enabled || !text) {
      setStreamedText('');
      setIsTyping(false);
      setIsComplete(false);
      return undefined;
    }

    setStreamedText('');
    setIsTyping(true);
    setIsComplete(false);

    cancelRef.current = streamAiChatText({
      fullText: text,
      speed,
      typingDelayMs,
      onTokenUpdate: setStreamedText,
      onTypingStart: () => setIsTyping(true),
      onTypingEnd: () => setIsTyping(false),
      onComplete: () => {
        setIsComplete(true);
        setStreamedText(text);
      },
    });

    return () => {
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [text, enabled, speed, typingDelayMs]);

  return {
    streamedText,
    isTyping,
    isComplete,
    displayText: isComplete ? text : streamedText,
  };
}
