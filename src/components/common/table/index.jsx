'use client';
import { useEffect, useMemo, useRef } from 'react';

export const IndeterminateCheckbox = ({ indeterminate, className = '', ...rest }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <label className="block w-fit cursor-pointer select-none items-center">
      <div className="relative w-fit">
        <input type="checkbox" ref={ref} className={`sr-only ${className}`} {...rest} />
        <div
          className={`flex h-5 w-5 items-center justify-center rounded border ${
            rest.checked && 'border-primary bg-gray dark:bg-transparent'
          }`}
        >
          <span className={`opacity-0 ${rest.checked && '!opacity-100'}`}>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                fill="#3056D3"
                stroke="#3056D3"
                strokeWidth="0.4"
              ></path>
            </svg>
          </span>
        </div>
      </div>
    </label>
  );
};

// `group` and `variant` are opt-in — actions without them render exactly as before (a flat
// row, no dividers, default hover color), so existing callers (ExpertsList, TagList,
// OnboardingQuizList, and every table built on useTable/useSelectionTable) are unaffected.
// Pass `group` on every action to cluster related actions with a divider between groups
// (e.g. 'view' | 'edit' | 'decision' | 'delete'), and `variant: 'danger'` on a destructive
// action to give it a red hover state instead of the default primary green.
export const TableActions = ({ row, actions = [] }) => {
  const visibleActions = useMemo(() => {
    return actions.filter(action => (action.render ? action.render(row) : true));
  }, [row, actions]);

  const hasGroups = visibleActions.some(action => action.group);

  // Grouped rows (currently only Certification's up-to-6-icon action column) use a tighter,
  // uniform gap and slightly smaller icons so the divider doesn't push the row into
  // horizontal-scroll territory; ungrouped rows keep the original space-x-3.5 / size-20 look
  // untouched (this branch is never taken when no action declares `group`).
  const containerClass = hasGroups ? 'flex items-center gap-1.5' : 'flex items-center space-x-3.5';
  const iconSize = hasGroups ? 17 : 20;

  const items = [];
  visibleActions.forEach((action, index) => {
    const previousGroup = index > 0 ? visibleActions[index - 1].group : undefined;
    if (hasGroups && index > 0 && action.group !== previousGroup) {
      items.push(<span key={`divider-${action.id}`} className="h-4 w-px bg-stroke" aria-hidden="true" />);
    }
    const hoverClass = action.variant === 'danger' ? 'hover:text-red-600' : 'hover:text-primary';
    items.push(
      <button key={action.id} onClick={() => action.onClick(row)} className={hoverClass}>
        <action.Icon size={iconSize} />
      </button>
    );
  });

  return <div className={containerClass}>{items}</div>;
};

export { default as BasicTable } from './BasicTable';
export { default as SelectionTable } from './SelectionTable';
