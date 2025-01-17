import Image from 'next/image';
import Avatar from '@mui/material/Avatar';

const ProgramExpertsList = ({ experts = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {experts.map((expert, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <Avatar src={expert.image} alt={expert.name} />
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{expert.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{expert.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramExpertsList;
