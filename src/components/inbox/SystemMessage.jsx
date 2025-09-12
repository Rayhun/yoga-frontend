'use client';
import dayjs from 'dayjs';
import { FiUsers, FiUserPlus, FiUserMinus } from 'react-icons/fi';

const SystemMessage = ({ message, time, type = 'join' }) => {
  const getIcon = () => {
    switch (type) {
      case 'join':
        return <FiUserPlus className="w-4 h-4 text-green-600" />;
      case 'leave':
        return <FiUserMinus className="w-4 h-4 text-red-600" />;
      case 'group':
        return <FiUsers className="w-4 h-4 text-blue-600" />;
      default:
        return <FiUsers className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMessageStyle = () => {
    switch (type) {
      case 'join':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'leave':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'group':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex justify-center my-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getMessageStyle()} max-w-md`}>
        {getIcon()}
        <span className="text-center">{message}</span>
        <span className="text-xs opacity-70 ml-2">
          {dayjs(time).format('hh:mm A')}
        </span>
      </div>
    </div>
  );
};

export default SystemMessage;
