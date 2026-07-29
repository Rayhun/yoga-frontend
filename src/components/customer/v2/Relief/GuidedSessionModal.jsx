'use client';

import Dialog from '@mui/material/Dialog';
import { FiX } from 'react-icons/fi';

function MediaContent({ contentType, link, title }) {
  if (!link) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-8 text-center text-gray-500">
        No guided session media has been configured for this tool yet.
      </div>
    );
  }

  switch (contentType) {
    case 'video':
      return (
        <video
          key={link}
          src={link}
          controls
          autoPlay
          className="max-h-[70vh] w-full rounded-xl bg-black"
        >
          <track kind="captions" />
        </video>
      );
    case 'audio':
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl">
            🎧
          </div>
          <audio key={link} src={link} controls autoPlay className="w-full max-w-lg">
            <track kind="captions" />
          </audio>
        </div>
      );
    case 'image':
      return (
        <img
          src={link}
          alt={title || 'Guide / lesson'}
          className="max-h-[70vh] w-full rounded-xl object-contain"
        />
      );
    default:
      return (
        <div className="flex min-h-[200px] items-center justify-center p-8 text-center text-gray-500">
          Unsupported content type.
        </div>
      );
  }
}

export default function GuidedSessionModal({ open, onClose, session, title }) {
  const contentType = session?.content_type;
  const link = session?.link;
  const modalTitle = session?.title || title;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        className: 'rounded-3xl overflow-hidden',
      }}
    >
      <div className="border-b border-stone-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
              Guided Session
            </p>
            <h2 className="mt-1 font-serif text-xl text-gray-900">{modalTitle || 'Session'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-gray-500 transition hover:bg-stone-50 hover:text-gray-800"
            aria-label="Close guided session"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-stone-50 p-4 md:p-6">
        <MediaContent contentType={contentType} link={link} title={modalTitle} />
      </div>
    </Dialog>
  );
}
