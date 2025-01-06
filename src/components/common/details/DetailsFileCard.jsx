/* eslint-disable @next/next/no-img-element */
'use client';
import { useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import { MdDownload, MdAttachFile } from 'react-icons/md';

const DetailsFileCard = ({ fileURL = '', isImage }) => {
  const fileName = useMemo(() => fileURL.substring(fileURL.lastIndexOf('/') + 1), [fileURL]);

  if (!fileURL) return null;

  return (
    <div className="w-[200px] h-[200px] bg-gray-300 rounded-lg shadow-lg relative group flex justify-center items-center">
      <MdAttachFile size={50} />
      {isImage ? (
        <img src={fileURL} className="absolute top-0 left-0 rounded-lg w-full h-full" alt="image" />
      ) : null}
      <div className="absolute hidden group-hover:flex top-0 left-0 w-full h-full rounded-lg bg-black/80 flex-col gap-1 justify-center items-center">
        <IconButton onClick={() => window.open(fileURL, '_blank')}>
          <MdDownload size={40} className="text-slate-200" />
        </IconButton>
        <p className="max-w-[80%] break-words text-white">{fileName}</p>
      </div>
    </div>
  );
};

export default DetailsFileCard;
