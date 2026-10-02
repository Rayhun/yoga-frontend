'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { FiX } from 'react-icons/fi';
import { hasSectionInfo } from '@/utils/customer-v2-home';

export function useSectionInfoModal() {
  const [infoModalData, setInfoModalData] = useState(null);

  const openSectionInfo = data => {
    if (data) setInfoModalData(data);
  };

  const closeSectionInfo = () => setInfoModalData(null);

  return {
    infoModalData,
    openSectionInfo,
    closeSectionInfo,
    isSectionInfoOpen: Boolean(infoModalData),
  };
}

/** Fixed top-right corner of the card shell (matches mockup inset). */
export const CARD_INFO_ICON_POSITION =
  'absolute right-4 top-4 z-20 sm:right-5 sm:top-5 lg:right-6 lg:top-6';

export function SectionInfoButton({ sectionData, onOpen, className = '' }) {
  if (!hasSectionInfo(sectionData)) return null;

  const icon = sectionData.info?.icon || 'i';

  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation();
        onOpen?.(sectionData.info.data);
      }}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-[10px] font-semibold italic leading-none text-gray-500 shadow-sm transition hover:border-primary/35 hover:text-primary ${className}`}
      aria-label="More information"
    >
      {icon}
    </button>
  );
}

/** Inline row: leading content + info button aligned top-right of the row */
export function SectionTitleRow({ sectionData, onInfoOpen, children, className = '' }) {
  if (!hasSectionInfo(sectionData)) {
    return children ? <div className={className}>{children}</div> : null;
  }

  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0 flex-1">{children}</div>
      <SectionInfoButton sectionData={sectionData} onOpen={onInfoOpen} className="mt-0.5" />
    </div>
  );
}

/**
 * Wraps card content and pins the info icon to the card's top-right corner.
 * Parent must be the card shell (`relative` + padding). Use `w-full` on flex children.
 */
export function CardInfoCorner({ sectionData, onInfoOpen, children, className = '' }) {
  const showInfo = hasSectionInfo(sectionData);

  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      {showInfo ? (
        <SectionInfoButton
          sectionData={sectionData}
          onOpen={onInfoOpen}
          className={CARD_INFO_ICON_POSITION}
        />
      ) : null}
      <div className={showInfo ? 'min-w-0 pr-9 sm:pr-10' : 'min-w-0'}>{children}</div>
    </div>
  );
}

/** @deprecated Use CardInfoCorner */
export function SectionInfoCorner({ sectionData, onInfoOpen, className = '' }) {
  return (
    <CardInfoCorner sectionData={sectionData} onInfoOpen={onInfoOpen} className={className} />
  );
}

function DisclaimerBox({ disclaimer }) {
  if (!disclaimer) return null;

  const isMint = disclaimer.style_variant === 'mint_green_tint_card';

  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 ${
        isMint
          ? 'border-emerald-100 bg-emerald-50/80'
          : 'border-stone-200 bg-stone-50'
      }`}
    >
      {disclaimer.title ? (
        <p className="text-sm font-semibold text-gray-900">{disclaimer.title}</p>
      ) : null}
      {disclaimer.bullet_points?.length ? (
        <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
          {disclaimer.bullet_points.map(point => (
            <li key={point} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function InfoModalFooter({ footer }) {
  if (!footer) return null;

  const linkAction = footer.link_action;
  const isOrangeLink = linkAction?.style_variant === 'orange_link';

  return (
    <div className="border-t border-stone-200/80 px-5 py-4">
      {footer.title ? (
        <p className="text-sm font-semibold text-gray-900">{footer.title}</p>
      ) : null}
      {footer.description ? (
        <p className="mt-1 text-sm text-gray-600">{footer.description}</p>
      ) : null}
      {linkAction?.label ? (
        <button
          type="button"
          className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold transition hover:underline ${
            isOrangeLink ? 'text-orange-600' : 'text-primary'
          }`}
        >
          {linkAction.label}
          {linkAction.icon ? <span>{linkAction.icon}</span> : null}
        </button>
      ) : null}
    </div>
  );
}

export default function SectionInfoModal({ open, data, onClose }) {
  if (!data) return null;

  const header = data.header || {};
  const body = data.body || {};
  const dismissIcon = header.dismiss_button?.icon || '✕';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: 'overflow-hidden rounded-3xl',
        sx: { margin: { xs: 2, sm: 3 } },
      }}
      sx={{
        zIndex: 1400,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(28, 36, 52, 0.45)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {data.drag_handle ? (
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-stone-300" aria-hidden />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
        <h2 className="font-serif text-xl leading-snug text-gray-900">
          {header.title || 'About This Section'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stroke text-body transition hover:bg-gray"
          aria-label="Close"
        >
          {dismissIcon === '✕' ? <FiX className="h-4 w-4" /> : dismissIcon}
        </button>
      </div>

      <div className="px-5 pb-5">
        {body.description ? (
          <p className="text-sm leading-relaxed text-gray-600">{body.description}</p>
        ) : null}
        <DisclaimerBox disclaimer={body.disclaimer_box} />
      </div>

      <InfoModalFooter footer={data.footer} />
    </Dialog>
  );
}
