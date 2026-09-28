'use client';
import React, { useRef } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheck } from 'react-icons/fi';

const MARKERS = {
  ok: { Icon: FiCheck, className: 'text-primary', label: 'complete' },
  warn: { Icon: FiAlertTriangle, className: 'text-amber-500', label: 'needs attention' },
  error: { Icon: FiAlertCircle, className: 'text-red-500', label: 'could not save' },
};

/**
 * Step 2's section tabs (Curriculum · Pricing · Certificate · Publish). Only the tab strip lives
 * here — the parent renders every panel and keeps them all mounted (hidden with CSS), so switching
 * tabs never drops unsaved or failed values. ←/→/Home/End move between tabs (roving tabindex).
 *
 * `tabs`: [{ id, label, panelId, marker?: 'ok' | 'warn' | 'error' }]
 */
const BuilderTabs = ({ tabs, activeTab, onSelect }) => {
  const buttonRefs = useRef({});

  const handleKeyDown = (event, index) => {
    const last = tabs.length - 1;
    const targetIndex = { ArrowRight: Math.min(index + 1, last), ArrowLeft: Math.max(index - 1, 0), Home: 0, End: last }[
      event.key
    ];
    if (targetIndex === undefined) return;
    event.preventDefault();
    const target = tabs[targetIndex];
    buttonRefs.current[target.id]?.focus();
    onSelect(target.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Program content sections"
      className="-mx-4 flex gap-1 overflow-x-auto border-b border-stroke px-4 dark:border-strokedark sm:-mx-6.5 sm:px-6.5"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const marker = MARKERS[tab.marker];
        return (
          <button
            key={tab.id}
            ref={node => {
              buttonRefs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`${tab.panelId}-tab`}
            aria-controls={tab.panelId}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={event => handleKeyDown(event, index)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
              isActive ? 'border-primary text-primary' : 'border-transparent text-body hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.label}
            {marker ? (
              <>
                <marker.Icon aria-hidden size={14} className={marker.className} />
                <span className="sr-only">({marker.label})</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default BuilderTabs;
