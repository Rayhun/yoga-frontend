'use client';
import { useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import { MdDownload } from 'react-icons/md';

const DetailsFileCard = ({ fileURL = '' }) => {
  const fileName = useMemo(() => fileURL.substring(fileURL.lastIndexOf('/') + 1), [fileURL]);
  return (
    <div className="w-[200px] h-[200px] bg-gray-300 rounded-lg shadow-lg flex flex-col justify-center items-center gap-3 text-center">
      <IconButton onClick={() => window.open(fileURL, '_blank')}>
        <MdDownload size={20} className="text-slate-400" />
      </IconButton>
      <p className="max-w-[80%] break-words">{fileName}</p>
    </div>
  );
};

export default DetailsFileCard;
