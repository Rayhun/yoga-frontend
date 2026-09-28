'use client';
import React from 'react';
import Popup from '@/components/common/popup';
import ProgramCard from '@/components/certification/learner/ProgramCard';

// The builder's program detail → the fields the learner catalog card reads. Counts are derived
// from the saved curriculum; `creator_type` isn't on the detail payload, so that corner badge is
// simply not shown here.
const toCatalogPreview = program => {
  const modules = program?.modules || [];
  return {
    ...program,
    module_count: modules.length,
    lesson_count: modules.reduce((total, module) => total + (module.lessons || []).length, 0),
  };
};

const noop = () => null;

/**
 * "Preview" header action: the program as it appears in the learner catalog, rendered with the
 * learner's own ProgramCard so the preview can't drift from the real thing. Shows saved data only.
 */
const ProgramPreviewPopup = ({ open, program, onClose }) => (
  <Popup open={open} onClose={onClose} heading="Catalog preview" size="xs">
    <p className="mb-4 text-sm text-body">How learners see this program in the catalog (saved changes only).</p>
    <div className="mx-auto max-w-[320px] text-left">
      {program ? <ProgramCard program={toCatalogPreview(program)} onClick={noop} /> : null}
    </div>
  </Popup>
);

export default ProgramPreviewPopup;
