'use client';
import { useState } from 'react';
import SystemMessage from './SystemMessage';
import { detectSystemMessage } from '@/utils/messagePatterns';

const SystemMessageDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  // Sample messages that would be detected as system messages
  const sampleMessages = [
    "Hassann joined the group",
    "Sarah left the group", 
    "Ahmed has joined the group",
    "Mike was added to the group",
    "John is now an admin",
    "Lisa created the group",
    "David was removed from the group",
    "Welcome Maria to the group",
    "Tom is no longer a member"
  ];

  if (!showDemo) {
    return (
      <div className="p-4 text-center border-b border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setShowDemo(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Demo: Show System Message Detection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[rgba(239,233,224,0.54)] border-b border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Message Detection Demo
        </h3>
        <button
          onClick={() => setShowDemo(false)}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Hide Demo
        </button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        These messages will automatically appear as WhatsApp-style system messages:
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sampleMessages.map((messageText, index) => {
          const detection = detectSystemMessage(messageText);
          
          return (
            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Regular Message: "{messageText}"
                </div>
                <div className="text-xs text-gray-500">
                  Detected as: <span className="font-medium text-blue-600">{detection?.type || 'Not detected'}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {detection && (
                  <div className="w-48">
                    <SystemMessage
                      message={messageText}
                      time={new Date().toISOString()}
                      type={detection.type}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> When messages contain join/leave patterns like "Name joined the group" or "Name left the group", 
          they're automatically detected and displayed as WhatsApp-style system messages instead of regular chat bubbles.
        </div>
      </div>
    </div>
  );
};

export default SystemMessageDemo;
