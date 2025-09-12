'use client';
import { useState } from 'react';
import SystemMessage from './SystemMessage';

/**
 * Demo component to show how system messages would look
 * This can be used to test the system message appearance
 */
const DemoSystemMessages = () => {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="p-4 text-center">
        <button
          onClick={() => setShowDemo(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Show Demo System Messages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-[rgba(239,233,224,0.54)]">
      <div className="text-center text-sm text-gray-600 mb-4">
        Demo System Messages (like WhatsApp)
      </div>
      
      <SystemMessage
        message="John Doe joined the group"
        time={new Date().toISOString()}
        type="join"
      />
      
      <SystemMessage
        message="Sarah Smith left the group"
        time={new Date().toISOString()}
        type="leave"
      />
      
      <SystemMessage
        message="Mike Johnson created this group"
        time={new Date().toISOString()}
        type="group"
      />
      
      <SystemMessage
        message="You joined 'Yoga Enthusiasts'"
        time={new Date().toISOString()}
        type="join"
      />
      
      <div className="text-center mt-6">
        <button
          onClick={() => setShowDemo(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Hide Demo
        </button>
      </div>
    </div>
  );
};

export default DemoSystemMessages;
