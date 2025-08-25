'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
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

const ModuleContent = ({ total_item = 0, completed_item = 0 }) => {
  const progress = useMemo(
    () => (total_item <= 1 ? 0 : (completed_item / total_item) * 100),
    [completed_item, total_item]
  );

  return (
    <div className="flex flex-col gap-2 mb-2">
      <p className="text-bodydark2 text-sm">
        {completed_item}/{total_item} completed
      </p>
      <LinearProgress color="secondary" className="rounded-full" value={progress} />
    </div>
  );
};

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
      <Icon size={22} className="text-secondary" />
      <p className="text-bodydark2 text-md">{text}</p>
    </div>
  );
};

const ContentCard = ({ item, isEnrolled = false }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const contentRef = getContentRef(item);

  const handleNavigate = () => {
    if (!isEnrolled) {
      toast.error('Please enroll in this program to access the content');
      return;
    }
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('program', params.id);
    router.push(`${contentRef.href}?${newParams.toString()}`);
  };

  const contentImage = item.content_type === 'quiz' ? '/images/content/quiz.png' : item?.image;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-[16/9]">
          <Image
            width={0}
            height={0}
            src={contentImage || '/images/content/default.png'}
            alt="image"
            sizes="100vw"
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
        {/* Completion Icon */}
        {item.completed ? (
          <div className="absolute -bottom-4 left-2 bg-white rounded-full p-1 shadow-lg">
            <BiCheck size={24} className="bg-secondary rounded-full text-white" />
          </div>
        ) : null}
      </div>

      {/* Course Info */}
      <div className="p-4 flex flex-col justify-between h-[110px]">
        <h2 className="text-lg font-bold line-clamp-1 text-gray-900 dark:text-white">{item.title}</h2>

        {/* Details */}
        {item.content_type === 'module' ? <ModuleContent {...item} /> : <SessionQuizContent {...item} />}
      </div>
    </div>
  );
};

export default ContentCard;
