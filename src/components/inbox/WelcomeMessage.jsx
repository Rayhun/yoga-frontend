'use client';
import { FiUsers } from 'react-icons/fi';
import Image from 'next/image';

// Coaches Icon Component - Uses woman icon image (no matching icon found)
const CoachesIcon = ({ className = "w-8 h-8 md:w-10 md:h-10" }) => {
  return (
    <Image
      src="/images/icon/woman.png"
      alt="Coaches"
      width={40}
      height={40}
      className={className}
    />
  );
};

const WelcomeMessage = ({ activeTab = 'circles', onExploreCircles, onFindCoach, showDiscover = true }) => {

  // Default welcome message
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-white">
      <div className="text-center max-w-md w-full px-4">
        {/* Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          {activeTab === 'circles' ? (
            <FiUsers className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
          ) : (
            <CoachesIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
          {activeTab === 'circles' ? 'Welcome to Circles' : 'Connect with Coaches'}
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          {activeTab === 'circles'
            ? (showDiscover ? 'Select a circle to start chatting, or discover new ones to join.' : 'Select a circle to start chatting.')
            : 'Select a coach to chat, or find new coaches to help you'}
        </p>

        {/* Action Button */}
        {((activeTab === 'circles' && showDiscover && onExploreCircles) || (activeTab === 'coaches' && onFindCoach)) && (
        <button
          onClick={() => {
            if (activeTab === 'circles' && onExploreCircles) {
              onExploreCircles();
            } else if (activeTab === 'coaches' && onFindCoach) {
              onFindCoach();
            }
          }}
          className="w-full sm:w-auto px-6 py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
        >
          {activeTab === 'circles' ? 'Explore Circles' : 'Find a Coach'}
        </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
