'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { FaRegFileAudio, FaRegFileImage, FaRegFileVideo, FaRegNewspaper } from 'react-icons/fa6';
import { IoMdPaper } from 'react-icons/io';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import { PROGRAM_TYPE } from '@/utils/enums';

const ContentCard = ({ content_id, content_type, drip }) => {
  const Icon = useMemo(() => {
    if (content_type === PROGRAM_TYPE.audio) return FaRegFileAudio;
    if (content_type === PROGRAM_TYPE.image) return FaRegFileImage;
    if (content_type === PROGRAM_TYPE.video) return FaRegFileVideo;
    if (content_type === PROGRAM_TYPE.quiz) return FaRegNewspaper;
    return IoMdPaper;
  }, [content_type]);

  const docLink = useMemo(() => {
    if (content_type === PROGRAM_TYPE.audio) return '/portal/admin/lms/session/audio';
    if (content_type === PROGRAM_TYPE.image) return '/portal/admin/lms/session/image';
    if (content_type === PROGRAM_TYPE.video) return '/portal/admin/lms/session/video';
    if (content_type === PROGRAM_TYPE.quiz) return '/portal/admin/lms/quiz';
    return '/';
  }, [content_type]);

  return (
    <Link href={`${docLink}/${content_id}/details`}>
      <div className="w-[100px] h-[100px] bg-gray-300 rounded-lg shadow-lg relative group flex flex-col gap-2 justify-center items-center">
        <Icon size={30} />
        <p className="max-w-[80%] break-words dark:text-white">
          {content_type} ({drip})
        </p>
      </div>
    </Link>
  );
};

const ProgramDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Program">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="File">
          <DetailsFileCard fileURL={data.image} isImage />
        </DetailsRecord>
        <DetailsRecord label="Access Setting">{data.access_setting}</DetailsRecord>
        <DetailsRecord label="Visibility Setting">{data.visibility_setting}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.categories} getChipLabel={i => i.name} />
        <MultiValueDetailsRecord label="Tags" data={data.tags} getChipLabel={i => i.name} />
        <DetailsRecord label="Content">
          <div className="flex flex-wrap gap-3">
            {data.program?.map(item => (
              <ContentCard key={item.id} {...item} />
            ))}
          </div>
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ProgramDetails;
