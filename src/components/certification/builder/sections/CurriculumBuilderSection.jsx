'use client';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { MdAdd } from 'react-icons/md';
import Button from '@/components/common/Button';
import useConfirm from '@/hooks/useConfirm';
import SectionCard from '@/components/certification/builder/SectionCard';
import useReportSaveStatus from '@/components/certification/builder/useReportSaveStatus';
import CurriculumOutline from '@/components/certification/builder/curriculum/CurriculumOutline';
import ItemSaveState from '@/components/certification/builder/curriculum/ItemSaveState';
import LessonPane from '@/components/certification/builder/curriculum/LessonPane';
import ModuleFold from '@/components/certification/builder/curriculum/ModuleFold';
import NewItemForm from '@/components/certification/builder/curriculum/NewItemForm';
import { PANE_STATUS, isUnsafeStatus } from '@/components/certification/builder/curriculum/paneState';
import { locateByKey, moduleKeyOf, resolveSelectedKey } from '@/components/certification/builder/curriculum/selection';
import useCurriculum from '@/components/certification/builder/curriculum/useCurriculum';

const USER_CANCELLED = 'User cancelled';
const HOME = { kind: 'home' };

const samePaneState = (a, b) =>
  a?.key === b?.key &&
  a?.status === b?.status &&
  a?.message === b?.message &&
  a?.canRetry === b?.canRetry &&
  a?.retry === b?.retry &&
  a?.attention === b?.attention;

const Banner = ({ tone, children, onDismiss }) => (
  <div
    role="alert"
    className={`mb-4 flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${
      tone === 'error'
        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
        : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
    }`}
  >
    <span className="flex items-start gap-2">
      <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </span>
    <button type="button" onClick={onDismiss} className="shrink-0 font-medium underline-offset-2 hover:underline">
      Dismiss
    </button>
  </div>
);

/**
 * Curriculum Builder: an outline of modules and lessons (right side on wide screens, above the pane on
 * narrow ones) and ONE edit pane for the selected item. Every user action is a single request that names
 * only that object (see useCurriculum) — the whole-tree PUT is no longer used. Creating an item asks for
 * its title first, so an untitled item never exists; each item shows its own save state; a stale or
 * refused change reloads the curriculum from the server and says why. Leaving the page while something
 * is unsaved or failed asks first.
 *
 * `ref.reload()` re-reads the whole curriculum from the server (for anything that changes it from outside
 * this screen, e.g. a CSV import). `onChanged` runs after each successful save so the shared
 * program-detail query — and with it Publish's readiness checks — is refetched.
 *
 * Until step 5b a lesson is edited with the existing lesson form inside the pane (LessonPane).
 */
const CurriculumBuilderSection = forwardRef(function CurriculumBuilderSection(
  { programId, initialModules, disabled = false, onChanged, onStatusChange, anchorId, urlItemKey = null, onItemChange },
  ref
) {
  const confirm = useConfirm();
  const curriculum = useCurriculum({ programId, initialModules, onChanged });
  const { modules, seed, notice, failure, blockedNotices, isBusy } = curriculum;

  // The item named by the URL (`?lesson=` / `?module=`) opens first; an unknown or stale one is ignored and
  // the first module opens, as before.
  const [selection, setSelection] = useState(() => {
    const fromUrl = urlItemKey && locateByKey(initialModules, urlItemKey) ? urlItemKey : null;
    if (fromUrl) return { kind: 'item', key: fromUrl, fallbackKey: moduleKeyOf(initialModules, fromUrl) };
    return initialModules[0] ? { kind: 'item', key: initialModules[0]._key, fallbackKey: initialModules[0]._key } : HOME;
  });
  const [paneState, setPaneState] = useState(null);
  const [itemStates, setItemStates] = useState(() => new Map());
  const paneRef = useRef(null);
  const switchingRef = useRef(false);

  useImperativeHandle(ref, () => ({ reload: curriculum.reload }), [curriculum.reload]);

  // What is open: the selected item if it still exists (else its module, else the first one).
  const activeKey = selection.kind === 'item' ? resolveSelectedKey(modules, selection.key, selection.fallbackKey) : null;
  const view = selection.kind === 'item' && !activeKey ? HOME : selection;
  const location = activeKey ? locateByKey(modules, activeKey) : null;

  const registerPane = useCallback(pane => {
    paneRef.current = pane;
  }, []);
  const handlePaneState = useCallback(
    state => {
      const next = { key: activeKey, ...state };
      setPaneState(previous => (samePaneState(previous, next) ? previous : next));
      setItemStates(previous => {
        const current = previous.get(activeKey);
        if (current?.status === state.status && current?.message === state.message && current?.attention === state.attention) return previous;
        return new Map(previous).set(activeKey, { status: state.status, message: state.message, attention: state.attention });
      });
    },
    [activeKey]
  );
  const openPaneState = paneState && paneState.key === activeKey ? paneState : null;

  // Save the open item before opening another; if it can't be saved, ask before dropping the edit.
  const requestSelect = useCallback(
    async next => {
      if (switchingRef.current) return false;
      switchingRef.current = true;
      try {
        const pane = paneRef.current;
        if (pane) {
          try {
            await pane.flush();
          } catch (error) {
            try {
              await confirm({
                heading: 'Unsaved changes',
                message: `This item has changes that could not be saved (${error.message}). Leave without saving them?`,
              });
            } catch (declined) {
              if (declined?.message === USER_CANCELLED) return false;
              throw declined;
            }
            pane.discard();
            // The dropped edit no longer exists; don't keep flagging it in the outline.
            setItemStates(previous => {
              const next = new Map(previous);
              next.delete(activeKey);
              return next;
            });
          }
        }
        setPaneState(null);
        setSelection(next);
        onItemChange?.(next.kind === 'item' ? next.key : null); // keep the URL in step (saved items only)
        return true;
      } finally {
        switchingRef.current = false;
      }
    },
    [confirm, activeKey, onItemChange]
  );

  const selectItem = useCallback(
    key => requestSelect({ kind: 'item', key, fallbackKey: moduleKeyOf(modules, key) }),
    [requestSelect, modules]
  );

  // Back/forward or a shared link changed the item in the URL: open it like a click would (the open item is
  // saved first). An item that no longer exists is ignored.
  useEffect(() => {
    if (!urlItemKey || urlItemKey === activeKey || !locateByKey(modules, urlItemKey)) return;
    requestSelect({ kind: 'item', key: urlItemKey, fallbackKey: moduleKeyOf(modules, urlItemKey) });
    // only a change of the URL's item should trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlItemKey]);

  const createModule = async ({ title }) => {
    const result = await curriculum.addModule({ title });
    if (result.ok) {
      setSelection({ kind: 'item', key: result.key, fallbackKey: result.key });
      onItemChange?.(result.key);
    }
  };
  const createLesson = moduleId => async values => {
    const result = await curriculum.addLesson(moduleId, values);
    if (result.ok) {
      setSelection({ kind: 'item', key: result.key, fallbackKey: `module-${moduleId}` });
      onItemChange?.(result.key);
    }
  };

  // One status for the builder's header: a failed action beats a saving one beats the open pane's state.
  const status = failure ? PANE_STATUS.error : isBusy ? PANE_STATUS.saving : openPaneState?.status || PANE_STATUS.idle;
  const canRetry = !failure && Boolean(openPaneState?.canRetry);
  useReportSaveStatus(onStatusChange, {
    status,
    errorMessage: status === PANE_STATUS.error ? failure || openPaneState?.message || null : null,
    canRetry,
    retry: canRetry ? openPaneState.retry : undefined,
  });

  // Leaving the page while something is unsaved, failed or still being sent.
  const hasUnsafeWork = isBusy || Boolean(failure) || isUnsafeStatus(openPaneState?.status);
  useEffect(() => {
    if (!hasUnsafeWork) return undefined;
    const warn = event => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsafeWork]);

  const dismissNotice = () => {
    curriculum.dismissNotice();
    curriculum.dismissBlocked();
  };

  const renderPane = () => {
    if (view.kind === 'new-module') {
      return <NewItemForm kind="module" disabled={disabled} onCreate={createModule} onCancel={() => setSelection(HOME)} />;
    }
    if (view.kind === 'new-lesson') {
      const parent = modules.find(module => module.id === view.moduleId);
      if (!parent) return null;
      return (
        <NewItemForm
          kind="lesson"
          parentTitle={parent.title}
          disabled={disabled}
          onCreate={createLesson(parent.id)}
          onCancel={() => setSelection(HOME)}
        />
      );
    }
    if (view.kind === 'item' && location) {
      const paneProps = { disabled, hasItem: curriculum.hasItem, registerPane, onState: handlePaneState };
      const paneKey = `${activeKey}-${seed}`;
      const openModule = modules[location.mi]; // (not named `module`: Next forbids assigning that name)
      const crumb = location.type === 'module' ? `Module ${location.mi + 1}` : `Module ${location.mi + 1} › Lesson ${location.li + 1}`;
      return (
        <>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <span className="text-sm font-medium text-body dark:text-gray-400">{crumb}</span>
            <div className="flex items-start gap-2">
              <ItemSaveState state={openPaneState} />
              {openPaneState?.canRetry ? (
                <button
                  type="button"
                  onClick={() => openPaneState.retry()}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:text-red-300"
                >
                  <FiRefreshCw size={11} /> Retry
                </button>
              ) : null}
            </div>
          </div>
          {location.type === 'module' ? (
            <ModuleFold key={paneKey} module={openModule} saveFields={curriculum.saveModuleFields} {...paneProps} />
          ) : (
            <LessonPane
              key={paneKey}
              lesson={openModule.lessons[location.li]}
              saveFields={curriculum.saveLessonFields}
              saveQuiz={curriculum.saveQuiz}
              {...paneProps}
            />
          )}
        </>
      );
    }
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-strokedark">
        <p className="text-sm text-body dark:text-gray-400">
          {modules.length ? 'Pick a module or lesson in the outline to edit it.' : 'Your curriculum is empty. Start with the first module.'}
        </p>
        {modules.length === 0 ? (
          <Button type="button" className="mx-auto mt-3" disabled={disabled} onClick={() => requestSelect({ kind: 'new-module' })}>
            <MdAdd className="mr-1" /> Add your first module
          </Button>
        ) : null}
      </div>
    );
  };

  return (
    <SectionCard
      anchorId={anchorId}
      title="Curriculum Builder"
      subtitle="Add modules and lessons — link to any video, PDF, or page you host elsewhere."
      status={status}
    >
      {failure ? (
        <Banner tone="error" onDismiss={curriculum.dismissFailure}>
          {failure}
        </Banner>
      ) : null}
      {notice ? (
        <Banner tone="warning" onDismiss={dismissNotice}>
          {notice.message}
        </Banner>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <aside className="lg:order-2">
          <CurriculumOutline
            modules={modules}
            selectedKey={activeKey}
            itemStates={itemStates}
            blockedNotices={blockedNotices}
            disabled={disabled}
            onSelect={selectItem}
            onAddModule={() => requestSelect({ kind: 'new-module' })}
            onAddLesson={moduleId => requestSelect({ kind: 'new-lesson', moduleId })}
            onMoveModule={curriculum.moveModule}
            onMoveLesson={curriculum.moveLessonWithinModule}
            onMoveLessonToModule={curriculum.moveLessonToModule}
            onRemoveModule={curriculum.removeModule}
            onRemoveLesson={curriculum.removeLesson}
          />
        </aside>
        <div className="min-w-0 lg:order-1" role="region" aria-label="Edit pane">
          {renderPane()}
        </div>
      </div>
    </SectionCard>
  );
});

export default CurriculumBuilderSection;
