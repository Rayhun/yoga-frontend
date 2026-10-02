const DEFAULT_AI_CHAT_ERROR = "Something went wrong. Please try again later.";

const AI_CHAT_ERROR_PATTERNS = [
  {
    test: /no active prompt|prompt not found|chat type/i,
    message: "I'm not available right now. Please try again later.",
  },
  {
    test: /invalid token|unauthorized|authentication|not authenticated/i,
    message: 'Please sign in again and try later.',
  },
  {
    test: /rate limit|too many requests/i,
    message: 'Please wait a moment and try again later.',
  },
  {
    test: /timeout|timed out/i,
    message: 'That took too long. Please try again later.',
  },
  {
    test: /connection|websocket|closed|disconnect/i,
    message: 'Connection issue. Please try again later.',
  },
];

export function getAiChatFriendlyErrorMessage(error) {
  if (error == null || error === '') return DEFAULT_AI_CHAT_ERROR;

  const text =
    typeof error === 'string'
      ? error
      : error?.message || error?.error || error?.detail || String(error);

  const trimmed = String(text).trim();
  if (!trimmed) return DEFAULT_AI_CHAT_ERROR;

  const matched = AI_CHAT_ERROR_PATTERNS.find(({ test }) => test.test(trimmed));
  return matched?.message || DEFAULT_AI_CHAT_ERROR;
}
