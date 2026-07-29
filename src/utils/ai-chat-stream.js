export function tokenizeAiChatText(fullText) {
  return fullText.match(/\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\S+|\s+/g) || [];
}

/**
 * Streams assistant text token-by-token with an optional typing delay first.
 */
export function streamAiChatText({
  fullText,
  onTokenUpdate,
  onTypingStart,
  onTypingEnd,
  onComplete,
  speed = 30,
  typingDelayMs = 450,
}) {
  let intervalRef = null;
  let delayRef = null;
  let cancelled = false;

  const cleanup = () => {
    if (intervalRef) clearInterval(intervalRef);
    if (delayRef) clearTimeout(delayRef);
    intervalRef = null;
    delayRef = null;
  };

  const cancel = () => {
    cancelled = true;
    cleanup();
    onTypingEnd?.();
  };

  onTypingStart?.();

  delayRef = setTimeout(() => {
    if (cancelled) return;

    const tokens = tokenizeAiChatText(fullText);
    let currentIndex = 0;
    let accumulated = '';

    intervalRef = setInterval(() => {
      if (cancelled) return;

      if (currentIndex < tokens.length) {
        accumulated += tokens[currentIndex];
        onTokenUpdate(accumulated);
        currentIndex += 1;
      } else {
        cleanup();
        onTypingEnd?.();
        onComplete?.();
      }
    }, speed);
  }, typingDelayMs);

  return cancel;
}
