'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { MdClose } from 'react-icons/md';
import {
  HiChevronDown,
  HiMagnifyingGlass,
  HiOutlineExclamationCircle,
  HiOutlineTag,
  HiPlus,
} from 'react-icons/hi2';
import useExpertCatalogTagOptions from '@/hooks/useExpertCatalogTagOptions';
import { getCatalogTagRowLabel } from '@/utils/catalogTag';
import useScrollToFirstErrorField from './useScrollToFirstErrorField';
import SelectedChipsScrollRegion from './SelectedChipsScrollRegion';

/**
 * Pill trigger opens a modal to search and multi-select catalog tags (canonical Tag IDs),
 * grouped by namespace with label-only options.
 */
const FormikCatalogTagsModalField = ({
  name,
  label,
  required,
  context = 'expert_profile',
  field: catalogField = '',
  surface = '',
  modalTitle = 'Select tags',
  searchPlaceholder = 'Search by label…',
  triggerPlaceholder = 'Select',
  maxSelections,
  seedRows = [],
  className = '',
  placeholder: _legacyPlaceholder,
  ...rest
}) => {
  const isSingleSelect = maxSelections === 1;
  const { setFieldValue, submitCount } = useFormikContext();
  const [field, meta] = useField(name);
  const containerRef = useScrollToFirstErrorField(name);

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  /** Namespace slugs that are collapsed in the picker list. */
  const [collapsedNamespaces, setCollapsedNamespaces] = useState(() => new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!open) return;
    setSearchInput('');
    setDebouncedSearch('');
    setCollapsedNamespaces(new Set());
  }, [open]);

  useEffect(() => {
    if (debouncedSearch) setCollapsedNamespaces(new Set());
  }, [debouncedSearch]);

  const selectedIds = useMemo(() => {
    const v = field.value;
    if (!v) return [];
    if (Array.isArray(v)) return v.map(Number).filter(n => !Number.isNaN(n));
    return [];
  }, [field.value]);

  const seedLabelById = useMemo(() => {
    const m = new Map();
    for (const row of seedRows ?? []) {
      if (row?.id == null) continue;
      const rowLabel = getCatalogTagRowLabel(row);
      if (rowLabel && String(rowLabel) !== String(row.id)) {
        m.set(row.id, rowLabel);
      }
    }
    return m;
  }, [seedRows]);

  const missingLabelIds = useMemo(
    () => selectedIds.filter(id => !seedLabelById.has(id)),
    [selectedIds, seedLabelById]
  );

  const {
    catalogRows,
    groupedCatalogRows,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useExpertCatalogTagOptions({
    context,
    field: catalogField,
    surface,
    search: debouncedSearch,
    enabled: open || missingLabelIds.length > 0,
  });

  const mergedCatalogRows = useMemo(() => {
    const byId = new Map();
    for (const row of seedRows ?? []) {
      if (row?.id != null) byId.set(row.id, row);
    }
    for (const row of catalogRows) {
      if (row?.id != null) byId.set(row.id, row);
    }
    return Array.from(byId.values());
  }, [catalogRows, seedRows]);

  const idToLabel = useMemo(() => {
    const m = new Map();
    mergedCatalogRows.forEach(row => {
      const rowLabel = getCatalogTagRowLabel(row);
      if (rowLabel && String(rowLabel) !== String(row.id)) {
        m.set(row.id, rowLabel);
      }
    });
    return m;
  }, [mergedCatalogRows]);

  const toggleId = useCallback(
    id => {
      const num = Number(id);
      let next;
      if (isSingleSelect) {
        next = selectedIds.includes(num) ? [] : [num];
      } else if (selectedIds.includes(num)) {
        next = selectedIds.filter(x => x !== num);
      } else if (maxSelections != null && selectedIds.length >= maxSelections) {
        return;
      } else {
        next = [...selectedIds, num];
      }
      setFieldValue(name, next, true);
    },
    [isSingleSelect, maxSelections, name, selectedIds, setFieldValue]
  );

  const toggleNamespaceCollapsed = useCallback(namespace => {
    setCollapsedNamespaces(prev => {
      const next = new Set(prev);
      if (next.has(namespace)) next.delete(namespace);
      else next.add(namespace);
      return next;
    });
  }, []);

  const handleListScroll = useCallback(
    e => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 72 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const isErrorField = Boolean(meta.error) && (meta.touched || submitCount > 0);
  const fieldLabel = (label || 'item').replace(/\?+$/, '').trim();
  const summaryText =
    selectedIds.length === 0
      ? triggerPlaceholder
      : isSingleSelect
        ? idToLabel.get(selectedIds[0]) ?? triggerPlaceholder
        : `${selectedIds.length} ${fieldLabel} selected`;

  const hasVisibleGroups = groupedCatalogRows.some(g => g.tags.length > 0);

  return (
    <div
      ref={containerRef}
      className={`flex min-w-0 flex-col gap-2 ${className}`}
      {...rest}
    >
      {label ? (
        <label
          className={`mb-0 block text-sm font-semibold tracking-tight text-gray-800 dark:text-white ${
            required ? 'required' : ''
          }`}
        >
          {label}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-3 rounded-full border bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300 hover:shadow dark:border-strokedark dark:bg-boxdark dark:hover:border-bodydark2 ${
          isErrorField ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200'
        }`}
      >
        <span
          className={
            selectedIds.length === 0
              ? 'text-sm text-gray-400 dark:text-bodydark2'
              : 'text-sm font-medium text-gray-900 dark:text-white'
          }
        >
          {summaryText}
        </span>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition group-hover:border-gray-300 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark2"
          aria-hidden
        >
          <HiPlus className="h-5 w-5" strokeWidth={2} />
        </span>
      </button>

      {selectedIds.length > 0 ? (
        <SelectedChipsScrollRegion
          measureKey={selectedIds.join('-')}
          selectedCount={selectedIds.length}
          kind="tag"
        >
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map(id => (
              <Chip
                key={id}
                size="small"
                label={idToLabel.get(id) ?? `Tag #${id}`}
                onDelete={() => toggleId(id)}
                className="!h-auto !max-w-full !rounded-lg !border !border-gray-200 !bg-gray-50 !py-0.5 !pl-2 !pr-1 !text-xs !font-medium !text-gray-800 dark:!border-strokedark dark:!bg-meta-4 dark:!text-white"
              />
            ))}
          </div>
        </SelectedChipsScrollRegion>
      ) : null}

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          backdrop: {
            className: '!bg-slate-900/50 backdrop-blur-[3px]',
          },
          paper: {
            elevation: 0,
            className:
              '!m-4 !max-h-[min(85vh,640px)] !w-full !max-w-md !overflow-hidden !rounded-[1.25rem] !border !border-gray-200/90 !bg-white !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] dark:!border-strokedark dark:!bg-boxdark dark:!shadow-black/40',
          },
        }}
      >
        <div className="flex max-h-[min(85vh,640px)] flex-col">
          <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                {modalTitle}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-bodydark2">
                {isSingleSelect
                  ? 'Tags are grouped by category. Select one label.'
                  : 'Tags are grouped by category. Select one or more labels.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-meta-4 dark:hover:text-white"
              aria-label="Close"
            >
              <MdClose size={22} />
            </button>
          </header>

          <div className="shrink-0 px-5 pb-1 pt-2">
            <div className="relative">
              <HiMagnifyingGlass
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-bodydark2"
                aria-hidden
              />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                autoComplete="off"
                className="w-full rounded-full border border-gray-200 bg-gray-50/80 py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-primary/0 transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:placeholder:text-bodydark2 dark:focus:border-primary dark:focus:bg-boxdark"
              />
            </div>
          </div>

          <div
            className="min-h-[240px] flex-1 overflow-y-auto px-3 py-2 sm:min-h-[280px]"
            onScroll={handleListScroll}
          >
            {isError ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                <HiOutlineExclamationCircle className="h-14 w-14 shrink-0 text-red-300 dark:text-red-400/80" />
                <p className="max-w-xs text-sm text-red-600 dark:text-red-400">
                  Could not load tags. Check your connection and try again.
                </p>
              </div>
            ) : isLoading && catalogRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-bodydark2">Loading tags…</p>
              </div>
            ) : !hasVisibleGroups ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <HiOutlineTag className="h-14 w-14 shrink-0 text-gray-200 dark:text-bodydark2" />
                <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-bodydark2">
                  {debouncedSearch
                    ? 'No tags match your search. Try different keywords.'
                    : 'No tags are available for this context yet.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {groupedCatalogRows.map(group => {
                  if (!group.tags.length) return null;
                  const isCollapsed = collapsedNamespaces.has(group.namespace);
                  const selectedInGroup = group.tags.filter(t =>
                    selectedIds.includes(t.id)
                  ).length;
                  return (
                    <li
                      key={group.namespace}
                      className="overflow-hidden rounded-xl border border-gray-100 dark:border-strokedark"
                    >
                      <button
                        type="button"
                        onClick={() => toggleNamespaceCollapsed(group.namespace)}
                        aria-expanded={!isCollapsed}
                        className="flex w-full items-center gap-2 bg-gray-50/80 px-3 py-2.5 text-left transition hover:bg-gray-100 dark:bg-meta-4/40 dark:hover:bg-meta-4"
                      >
                        <HiChevronDown
                          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-bodydark2 ${
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 text-sm font-bold text-gray-900 dark:text-white">
                          {group.namespaceLabel}
                        </span>
                        {selectedInGroup > 0 ? (
                          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/25">
                            {selectedInGroup}
                          </span>
                        ) : null}
                        <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-bodydark2">
                          {group.tags.length}
                        </span>
                      </button>
                      {!isCollapsed ? (
                        <ul>
                          {group.tags.map((tag, index) => {
                            const checked = selectedIds.includes(tag.id);
                            return (
                              <li
                                key={tag.id}
                                className={
                                  index > 0
                                    ? 'border-t border-gray-100 dark:border-strokedark'
                                    : ''
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleId(tag.id)}
                                  className={`flex w-full items-center gap-3 px-3 py-2.5 pl-9 text-left transition ${
                                    checked
                                      ? 'bg-emerald-50 dark:bg-primary/15'
                                      : 'hover:bg-gray-50 dark:hover:bg-meta-4'
                                  }`}
                                >
                                  <Checkbox
                                    checked={checked}
                                    size="small"
                                    tabIndex={-1}
                                    sx={{
                                      p: 0.25,
                                      pointerEvents: 'none',
                                      color: 'rgb(148 163 184)',
                                      '&.Mui-checked': {
                                        color: 'var(--mui-palette-primary-main, #16a34a)',
                                      },
                                    }}
                                  />
                                  <span className="min-w-0 flex-1 text-sm leading-snug text-gray-800 dark:text-white">
                                    {tag.label}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
            {isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : null}
          </div>

          <footer className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 pb-5 pt-4 dark:border-strokedark dark:bg-meta-4/50">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:brightness-110 active:scale-[0.99] dark:shadow-lg dark:shadow-black/30"
            >
              Done
            </button>
          </footer>
        </div>
      </Dialog>
    </div>
  );
};

export default FormikCatalogTagsModalField;
