'use client';
import Image from 'next/image';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const isImageUrl = url => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url || '');

const ImageSessionDetails = ({ data: sessionDetails }) => {
  const coverImage = sessionDetails?.image || sessionDetails?.thumbnail_image;
  const documentUrl = sessionDetails?.content_link || sessionDetails?.content_file;
  const showDocumentAsImage = documentUrl && isImageUrl(documentUrl) && documentUrl !== coverImage;

  return (
    <div className="flex flex-col gap-6">
      {coverImage ? (
        <div className="overflow-hidden rounded-lg bg-white p-4 shadow-md dark:bg-boxdark sm:p-6">
          <Image
            src={coverImage}
            alt={sessionDetails?.title || 'Cover image'}
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full rounded-lg shadow-lg"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-6 rounded-lg bg-white p-4 shadow-md dark:bg-boxdark sm:p-8">
        <h3 className="text-2xl font-bold dark:text-white">{sessionDetails.title}</h3>
        <ControllableRichText className="dark:text-white">
          {sessionDetails?.description || 'No description provided'}
        </ControllableRichText>

        {showDocumentAsImage ? (
          <Image
            src={documentUrl}
            alt="Guide document"
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full rounded-lg shadow-lg"
          />
        ) : null}

        {documentUrl && !showDocumentAsImage ? (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            View Document
          </a>
        ) : null}

        {sessionDetails?.content_audio ? (
          <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
            <p className="mb-3 text-sm font-medium text-black dark:text-white">Audio</p>
            <audio controls className="w-full" src={sessionDetails.content_audio}>
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ImageSessionDetails;
