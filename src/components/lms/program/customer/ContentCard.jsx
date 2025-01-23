'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LinearProgress from '@mui/material/LinearProgress';
import { BiCheck } from 'react-icons/bi';
import { FaTv, FaImage, FaHeadphones, FaPlayCircle } from 'react-icons/fa';
import { MdCheckBox } from 'react-icons/md';

const getContentRef = item => {
  let label = 'Item';
  let href = '#';

  if (item.content_type === 'module') {
    label = 'Module';
    href = `/portal/customer/lms/module/${item.id}/details`;
  } else if (item.content_type === 'session') {
    if (item.session_type === 'Image') {
      label = 'Session';
      href = `/portal/customer/lms/session/image/${item.id}/details`;
    } else if (item.session_type === 'Audio') {
      label = 'Session';
      href = `/portal/customer/lms/session/audio/${item.id}/details`;
    } else if (item.session_type === 'Video') {
      label = 'Session';
      href = `/portal/customer/lms/session/video/${item.id}/details`;
    }
  } else if (item.content_type === 'quiz') {
    label = 'Quiz';
    href = `/portal/customer/lms/quiz/${item.id}/details`;
  }
  return { label, href };
};

const ModuleContent = () => (
  <div className="flex flex-col gap-2 mb-2">
    <p className="text-bodydark2 text-sm">50/100 completed</p>
    <LinearProgress color="secondary" className="rounded-full" value={50} />
  </div>
);

const SessionQuizContent = ({ content_type, session_type, duration = '10 min' }) => {
  const Icon = useMemo(() => {
    if (content_type === 'quiz') return MdCheckBox;
    if (content_type === 'session' && session_type === 'Image') return FaImage;
    if (content_type === 'session' && session_type === 'Audio') return FaHeadphones;
    if (content_type === 'session' && session_type === 'Video') return FaPlayCircle;
    return FaTv;
  }, [content_type, session_type]);

  const text = useMemo(() => {
    if (content_type === 'quiz') return '1 question';
    if (content_type === 'session' && session_type === 'Image') return '1 image';
    if (content_type === 'session' && session_type === 'Audio') return `${duration} audio`;
    if (content_type === 'session' && session_type === 'Video') return `${duration} video`;
    return FaTv;
  }, [content_type, duration, session_type]);

  return (
    <div className="flex gap-2">
      <Icon size={18} className="text-secondary" />
      <p className="text-bodydark2 text-sm">{text}</p>
    </div>
  );
};

const ContentCard = ({ item }) => {
  const contentRef = getContentRef(item);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition">
      {/* Image */}
      <div className="relative">
        <Image
          width={0}
          height={0}
          src={item?.image || '/images/content/default.png'}
          alt="image"
          sizes="100vw"
          className="w-full h-40 object-cover rounded-t-lg"
        />
        {/* Completion Icon */}
        {item.completed ? (
          <div className="absolute -bottom-4 left-2 bg-white rounded-full p-1 shadow-lg">
            <BiCheck size={24} className="bg-secondary rounded-full text-white" />
          </div>
        ) : null}
      </div>

      {/* Course Info */}
      <div className="p-4 flex flex-col justify-between h-[160px]">
        <h2 className="text-lg font-bold line-clamp-1 text-gray-900 dark:text-white">{item.title}</h2>

        {/* Details */}
        {item.content_type === 'module' ? <ModuleContent {...item} /> : <SessionQuizContent {...item} />}

        {/* Action Button */}
        <Link href={contentRef.href}>
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/80 transition">
            {item.completed ? 'View' : 'Start'} {contentRef.label}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ContentCard;
