'use client';
import React from 'react';
import { FiAlertCircle, FiCheck, FiLoader } from 'react-icons/fi';
import { PANE_STATUS } from './paneState';

const COPY = {
  [PANE_STATUS.pending]: { text: 'Unsaved changes', className: 'text-gray-500' },
  [PANE_STATUS.saving]: { text: 'Saving…', className: 'text-gray-500' },
  [PANE_STATUS.saved]: { text: 'Saved', className: 'text-green-600' },
  [PANE_STATUS.error]: { text: 'Not saved', className: 'text-red-600' },
};

/** One item's save state — always shown for the open item; a failure carries its reason. */
const ItemSaveState = ({ state }) => {
  const copy = COPY[state?.status];
  if (!copy) return <span className="text-xs text-body dark:text-gray-400">Changes save automatically</span>;
  return (
    <span role={state.status === PANE_STATUS.error ? 'alert' : 'status'} className={`flex items-start gap-1.5 text-xs font-medium ${copy.className}`}>
      {state.status === PANE_STATUS.saving ? <FiLoader aria-hidden className="mt-0.5 animate-spin" size={13} /> : null}
      {state.status === PANE_STATUS.saved ? <FiCheck aria-hidden className="mt-0.5" size={13} /> : null}
      {state.status === PANE_STATUS.error ? <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" size={13} /> : null}
      <span>{state.message && state.status !== PANE_STATUS.saved ? `${copy.text}: ${state.message}` : copy.text}</span>
    </span>
  );
};

export default ItemSaveState;
