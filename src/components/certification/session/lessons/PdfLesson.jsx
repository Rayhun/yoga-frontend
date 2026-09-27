import { FaFilePdf } from 'react-icons/fa';
import MarkAsDoneButton from '../MarkAsDoneButton';

// Embedded viewer; many hosts refuse to be framed, so the "Open PDF" link is always shown too.
const PdfLesson = ({ lesson, programId }) => {
  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This PDF isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <object data={lesson.content_url} type="application/pdf" className="w-full h-[70vh] rounded-lg border border-gray-200">
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-gray-500">
          <FaFilePdf size={40} className="text-red-500" />
          <p>This PDF can&apos;t be shown here.</p>
        </div>
      </object>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href={lesson.content_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <FaFilePdf /> Open PDF in a new tab
        </a>
        <MarkAsDoneButton programId={programId} lesson={lesson} />
      </div>
    </div>
  );
};

export default PdfLesson;
