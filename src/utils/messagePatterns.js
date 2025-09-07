/**
 * Utility functions for detecting system message patterns in regular messages
 */

/**
 * Patterns for detecting join messages
 */
const JOIN_PATTERNS = [
  /(.+)\s+joined\s+(the\s+group|group)/i,
  /(.+)\s+has\s+joined\s+(the\s+group|group)/i,
  /(.+)\s+entered\s+(the\s+group|group)/i,
  /welcome\s+(.+)\s+to\s+(the\s+group|group)/i,
  /(.+)\s+is\s+now\s+a\s+member/i,
  /(.+)\s+was\s+added\s+to\s+(the\s+group|group)/i,
];

/**
 * Patterns for detecting leave messages
 */
const LEAVE_PATTERNS = [
  /(.+)\s+left\s+(the\s+group|group)/i,
  /(.+)\s+has\s+left\s+(the\s+group|group)/i,
  /(.+)\s+exited\s+(the\s+group|group)/i,
  /(.+)\s+was\s+removed\s+from\s+(the\s+group|group)/i,
  /(.+)\s+is\s+no\s+longer\s+a\s+member/i,
];

/**
 * Patterns for detecting group creation messages
 */
const GROUP_CREATION_PATTERNS = [
  /(.+)\s+created\s+(the\s+group|group|this\s+group)/i,
  /group\s+created\s+by\s+(.+)/i,
  /(.+)\s+started\s+(the\s+group|group|this\s+group)/i,
  /(.+)\s+founded\s+(the\s+group|group|this\s+group)/i,
];

/**
 * Patterns for detecting admin/role changes
 */
const ADMIN_PATTERNS = [
  /(.+)\s+is\s+now\s+an?\s+(admin|administrator|moderator)/i,
  /(.+)\s+was\s+promoted\s+to\s+(admin|administrator|moderator)/i,
  /(.+)\s+was\s+made\s+an?\s+(admin|administrator|moderator)/i,
  /(.+)\s+is\s+no\s+longer\s+an?\s+(admin|administrator|moderator)/i,
];

/**
 * Detects if a message is a system message based on content patterns
 * @param {string} messageContent - The message content to analyze
 * @returns {Object|null} - Returns { type, isSystemMessage } or null
 */
export const detectSystemMessage = (messageContent) => {
  if (!messageContent || typeof messageContent !== 'string') {
    return null;
  }

  const content = messageContent.trim();

  // Check for join patterns
  for (const pattern of JOIN_PATTERNS) {
    if (pattern.test(content)) {
      return { 
        type: 'join', 
        isSystemMessage: true,
        originalMessage: content
      };
    }
  }

  // Check for leave patterns
  for (const pattern of LEAVE_PATTERNS) {
    if (pattern.test(content)) {
      return { 
        type: 'leave', 
        isSystemMessage: true,
        originalMessage: content
      };
    }
  }

  // Check for group creation patterns
  for (const pattern of GROUP_CREATION_PATTERNS) {
    if (pattern.test(content)) {
      return { 
        type: 'group', 
        isSystemMessage: true,
        originalMessage: content
      };
    }
  }

  // Check for admin/role change patterns
  for (const pattern of ADMIN_PATTERNS) {
    if (pattern.test(content)) {
      return { 
        type: 'group', 
        isSystemMessage: true,
        originalMessage: content
      };
    }
  }

  return null;
};

/**
 * Checks if a message should be displayed as a system message
 * @param {Object} message - The message object
 * @returns {boolean} - True if should be displayed as system message
 */
export const isSystemMessage = (message) => {
  // Check if already marked as system message
  if (message.message_type === 'system' || message.type === 'system') {
    return true;
  }

  // Check content patterns
  const messageContent = message.content || message.message || '';
  const detection = detectSystemMessage(messageContent);
  
  return detection ? detection.isSystemMessage : false;
};

/**
 * Gets the system message type for a message
 * @param {Object} message - The message object
 * @returns {string} - The system message type
 */
export const getSystemMessageType = (message) => {
  // Return explicit system type if available
  if (message.system_type) {
    return message.system_type;
  }

  // Detect from content
  const messageContent = message.content || message.message || '';
  const detection = detectSystemMessage(messageContent);
  
  return detection ? detection.type : 'group';
};
