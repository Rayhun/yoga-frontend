import { FaUsers, FaUser } from 'react-icons/fa6';

const UserAvatar = ({ isGroup }) => {
  const Icon = isGroup ? FaUsers : FaUser;

  return (
    <div className="w-full h-full rounded-full bg-gray-300 flex justify-center items-center p-3">
      <Icon size={30} className="!text-bodydark2" />
    </div>
  );
};

export default UserAvatar;
