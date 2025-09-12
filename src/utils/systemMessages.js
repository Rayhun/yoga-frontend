/**
 * Utility functions for creating system messages (like WhatsApp join/leave notifications)
 */

export const SYSTEM_MESSAGE_TYPES = {
  JOIN: 'join',
  LEAVE: 'leave',
  GROUP_CREATED: 'group_created',
  ADMIN_CHANGED: 'admin_changed',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
};

/**
 * Creates a system message object
 * @param {string} type - Type of system message
 * @param {string} message - The message content
 * @param {Object} options - Additional options
 * @returns {Object} System message object
 */
export const createSystemMessage = (type, message, options = {}) => {
  return {
    id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message_type: 'system',
    type: 'system',
    system_type: type,
    content: message,
    message: message,
    created_at: new Date().toISOString(),
    sender: null,
    sender_name: 'System',
    attachments: [],
    ...options
  };
};

/**
 * Creates a user joined group message
 * @param {string} userName - Name of the user who joined
 * @param {string} groupName - Name of the group
 * @returns {Object} System message object
 */
export const createUserJoinedMessage = (userName, groupName) => {
  return createSystemMessage(
    SYSTEM_MESSAGE_TYPES.JOIN,
    `${userName} joined "${groupName}"`
  );
};

/**
 * Creates a user left group message
 * @param {string} userName - Name of the user who left
 * @param {string} groupName - Name of the group
 * @returns {Object} System message object
 */
export const createUserLeftMessage = (userName, groupName) => {
  return createSystemMessage(
    SYSTEM_MESSAGE_TYPES.LEAVE,
    `${userName} left "${groupName}"`
  );
};

/**
 * Creates a group created message
 * @param {string} creatorName - Name of the user who created the group
 * @param {string} groupName - Name of the group
 * @returns {Object} System message object
 */
export const createGroupCreatedMessage = (creatorName, groupName) => {
  return createSystemMessage(
    SYSTEM_MESSAGE_TYPES.GROUP_CREATED,
    `${creatorName} created "${groupName}"`
  );
};

/**
 * Creates a member added message
 * @param {string} adderName - Name of the user who added the member
 * @param {string} memberName - Name of the member who was added
 * @returns {Object} System message object
 */
export const createMemberAddedMessage = (adderName, memberName) => {
  return createSystemMessage(
    SYSTEM_MESSAGE_TYPES.MEMBER_ADDED,
    `${adderName} added ${memberName}`
  );
};
