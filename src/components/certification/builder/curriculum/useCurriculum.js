'use client';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useConfirm from '@/hooks/useConfirm';
import { describeSaveError } from '@/hooks/useSectionAutosave';
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getProgram,
  reorderLessons,
  reorderModules,
  saveLessonQuiz,
  updateLesson,
  updateModule,
} from '@/services/private/certification/program';
import { toLessonFormValues, toModuleFormValues, toModulesFormValues } from '@/components/certification/builder/sections/curriculumFields';

const CONFLICT_STATUS = 409;
const NOT_FOUND_STATUS = 404;
const USER_CANCELLED = 'User cancelled';
export const NOTICE_WARNING = 'warning';

const RELOADED_AFTER_CONFLICT =
  'The curriculum was changed somewhere else, so it has been reloaded with the latest version. Please make your change again.';
const RELOADED_AFTER_FAILURE = 'That change could not be saved, so the curriculum was reloaded with the latest saved version.';
const RELOADED_AFTER_MISSING = 'It was removed somewhere else, so the curriculum was reloaded with the latest saved version.';

const toModuleWithLessons = module => ({
  ...toModuleFormValues(module),
  lessons: (module.lessons || []).map(toLessonFormValues),
});

// Items sorted by the server's id list; anything the list doesn't mention stays at the end.
const orderByIds = (items, ids = []) => {
  const position = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity));
};

const moveInList = (list, index, direction) => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const mapModule = (modules, moduleId, update) => modules.map(module => (module.id === moduleId ? update(module) : module));

const bodyOf = response => response.data.data;

const EMPTY_BLOCKED = () => ({ byLesson: new Map(), byModule: new Map() });

/**
 * The curriculum builder's state and every server call it makes. Each user action is ONE request
 * that names only the object it changes (the granular endpoints); the whole-tree PUT is never used,
 * so a stale builder can no longer delete rows it has never seen.
 *
 * Structural actions (create, delete, reorder, move) run one at a time, in click order, and update the
 * local copy from the server's answer. A conflict (409) or any failed reorder reloads the curriculum
 * from the server and says so. Field edits are saved by the edit pane's own autosave through
 * `saveModuleFields` / `saveLessonFields` / `saveQuiz`, which throw so the pane can show the failure.
 *
 * `reload()` re-reads the whole curriculum from the server and replaces local state (it also bumps
 * `seed`, which remounts the edit pane) — call it after anything else changed the curriculum.
 */
const useCurriculum = ({ programId, initialModules, onChanged }) => {
  const confirm = useConfirm();
  const [modules, setModulesState] = useState(initialModules);
  const modulesRef = useRef(initialModules);
  const [seed, setSeed] = useState(0);
  const [busyCount, setBusyCount] = useState(0);
  const [failure, setFailure] = useState(null); // message of the last failed structural action
  const [notice, setNotice] = useState(null); // { tone, message }
  const [blockedNotices, setBlockedNotices] = useState(EMPTY_BLOCKED);
  const queueRef = useRef(Promise.resolve());

  const setModules = useCallback(update => {
    const next = typeof update === 'function' ? update(modulesRef.current) : update;
    modulesRef.current = next;
    setModulesState(next);
  }, []);

  const changed = useCallback(() => {
    Promise.resolve(onChanged?.()).catch(() => null);
  }, [onChanged]);

  const reload = useCallback(async () => {
    const { data } = await getProgram({ id: programId });
    setModules(toModulesFormValues(data));
    setSeed(value => value + 1);
    setFailure(null);
    changed();
    return modulesRef.current;
  }, [programId, setModules, changed]);

  // Whether the item is still in the curriculum (a pane's late save must not hit a deleted item).
  const hasItem = useCallback((type, id) => {
    const modulesNow = modulesRef.current;
    return type === 'module'
      ? modulesNow.some(module => module.id === id)
      : modulesNow.some(module => module.lessons.some(lesson => lesson.id === id));
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);
  const dismissFailure = useCallback(() => setFailure(null), []);
  const dismissBlocked = useCallback(() => setBlockedNotices(EMPTY_BLOCKED()), []);

  // Runs one structural action after the ones before it, tracking "something is saving".
  const enqueue = useCallback(job => {
    const run = queueRef.current.then(async () => {
      setBusyCount(count => count + 1);
      try {
        return await job();
      } finally {
        setBusyCount(count => count - 1);
      }
    });
    queueRef.current = run.catch(() => null);
    return run;
  }, []);

  const fail = useCallback((error, prefix) => {
    const message = `${prefix}: ${describeSaveError(error)}`;
    setFailure(message);
    toast.error(message);
    return { ok: false };
  }, []);

  // After a rejected reorder / stale list: show the latest saved curriculum and say so.
  const recoverByReloading = useCallback(
    async (snapshot, message) => {
      try {
        await reload();
        setNotice({ tone: NOTICE_WARNING, message });
      } catch (reloadError) {
        setModules(snapshot);
        setNotice({ tone: NOTICE_WARNING, message: `${RELOADED_AFTER_FAILURE} (${describeSaveError(reloadError)})` });
      }
      return { ok: false };
    },
    [reload, setModules]
  );

  // A 404 means the item was removed somewhere else: reload and show what the server said.
  const reloadIfMissing = useCallback(
    async error => {
      if (error?.response?.status !== NOT_FOUND_STATUS) return false;
      await recoverByReloading(modulesRef.current, `${describeSaveError(error)} ${RELOADED_AFTER_MISSING}`);
      return true;
    },
    [recoverByReloading]
  );
  const failOrReload = useCallback(
    async (error, prefix) => ((await reloadIfMissing(error)) ? { ok: false, missing: true } : fail(error, prefix)),
    [reloadIfMissing, fail]
  );

  // ---- create ---------------------------------------------------------------------------------

  const addModule = useCallback(
    ({ title }) =>
      enqueue(async () => {
        try {
          const { module, module_order: order } = bodyOf(await createModule({ id: programId, payload: { title } }));
          setModules(previous => orderByIds([...previous, toModuleWithLessons(module)], order));
          setFailure(null);
          changed();
          return { ok: true, key: `module-${module.id}` };
        } catch (error) {
          return fail(error, 'Could not add the module');
        }
      }),
    [enqueue, programId, setModules, changed, fail]
  );

  const addLesson = useCallback(
    (moduleId, { title, lesson_type: lessonType }) =>
      enqueue(async () => {
        try {
          const { lesson, lesson_orders: orders } = bodyOf(
            await createLesson({ id: programId, moduleId, payload: { title, lesson_type: lessonType } })
          );
          setModules(previous =>
            mapModule(previous, moduleId, module => ({
              ...module,
              lessons: orderByIds([...module.lessons, toLessonFormValues(lesson)], orders[moduleId]),
            }))
          );
          setFailure(null);
          changed();
          return { ok: true, key: `lesson-${lesson.id}` };
        } catch (error) {
          return failOrReload(error, 'Could not add the lesson');
        }
      }),
    [enqueue, programId, setModules, changed, failOrReload]
  );

  // ---- edit (called by the edit pane's autosave; these throw) ---------------------------------

  // The pane shows these errors itself; a 404 (the item is gone) additionally reloads and says so.
  const saveModuleFields = useCallback(
    async (moduleId, payload) => {
      try {
        const { module } = bodyOf(await updateModule({ id: programId, moduleId, payload }));
        setModules(previous =>
          mapModule(previous, moduleId, existing => ({ ...toModuleFormValues(module), lessons: existing.lessons }))
        );
        changed();
        return module;
      } catch (error) {
        await reloadIfMissing(error);
        throw error;
      }
    },
    [programId, setModules, changed, reloadIfMissing]
  );

  const saveLessonFields = useCallback(
    async (lessonId, payload) => {
      try {
        const { lesson } = bodyOf(await updateLesson({ id: programId, lessonId, payload }));
        setModules(previous =>
          previous.map(module => ({
            ...module,
            lessons: module.lessons.map(existing =>
              existing.id === lessonId ? { ...toLessonFormValues(lesson), questions: existing.questions } : existing
            ),
          }))
        );
        changed();
        return lesson;
      } catch (error) {
        await reloadIfMissing(error);
        throw error;
      }
    },
    [programId, setModules, changed, reloadIfMissing]
  );

  const saveQuiz = useCallback(
    async (lessonId, questions) => {
      try {
        const { lesson } = bodyOf(await saveLessonQuiz({ id: programId, lessonId, questions }));
        setModules(previous =>
          previous.map(module => ({
            ...module,
            lessons: module.lessons.map(existing =>
              existing.id === lessonId ? { ...existing, questions: toLessonFormValues(lesson).questions } : existing
            ),
          }))
        );
        changed();
        return lesson;
      } catch (error) {
        await reloadIfMissing(error);
        throw error;
      }
    },
    [programId, setModules, changed, reloadIfMissing]
  );

  // ---- delete ---------------------------------------------------------------------------------

  // A refused delete (learners have progress): show the server's own message, and reload so the
  // screen matches what is really saved.
  const handleDeleteConflict = useCallback(
    async (error, toBlockedNotices) => {
      const message = describeSaveError(error);
      toast.error(message);
      try {
        await reload();
      } catch (reloadError) {
        setFailure(`The curriculum could not be reloaded: ${describeSaveError(reloadError)}`);
      }
      setBlockedNotices(toBlockedNotices(message));
      setNotice({ tone: NOTICE_WARNING, message });
      return { ok: false, blocked: true };
    },
    [reload]
  );

  const confirmDelete = useCallback(
    async message => {
      try {
        await confirm({ heading: 'Delete', message });
        return true;
      } catch (error) {
        if (error?.message === USER_CANCELLED) return false;
        throw error;
      }
    },
    [confirm]
  );

  const removeModule = useCallback(
    async moduleId => {
      const target = modulesRef.current.find(item => item.id === moduleId);
      const lessonCount = target?.lessons.length || 0;
      const detail = lessonCount ? ` and its ${lessonCount} lesson${lessonCount === 1 ? '' : 's'}` : '';
      if (!(await confirmDelete(`Delete the module “${target?.title}”${detail}? This can’t be undone.`))) {
        return { ok: false, cancelled: true };
      }
      return enqueue(async () => {
        try {
          await deleteModule({ id: programId, moduleId });
          setModules(previous => previous.filter(item => item.id !== moduleId));
          setFailure(null);
          changed();
          return { ok: true };
        } catch (error) {
          if (error?.response?.status === CONFLICT_STATUS) {
            return handleDeleteConflict(error, message => ({ byLesson: new Map(), byModule: new Map([[moduleId, message]]) }));
          }
          return failOrReload(error, 'Could not delete the module');
        }
      });
    },
    [confirmDelete, enqueue, programId, setModules, changed, handleDeleteConflict, failOrReload]
  );

  const removeLesson = useCallback(
    async lessonId => {
      const lesson = modulesRef.current.flatMap(module => module.lessons).find(item => item.id === lessonId);
      if (!(await confirmDelete(`Delete the lesson “${lesson?.title}”? This can’t be undone.`))) {
        return { ok: false, cancelled: true };
      }
      return enqueue(async () => {
        try {
          await deleteLesson({ id: programId, lessonId });
          setModules(previous =>
            previous.map(module => ({ ...module, lessons: module.lessons.filter(item => item.id !== lessonId) }))
          );
          setFailure(null);
          changed();
          return { ok: true };
        } catch (error) {
          if (error?.response?.status === CONFLICT_STATUS) {
            return handleDeleteConflict(error, message => ({ byLesson: new Map([[lessonId, message]]), byModule: new Map() }));
          }
          return failOrReload(error, 'Could not delete the lesson');
        }
      });
    },
    [confirmDelete, enqueue, programId, setModules, changed, handleDeleteConflict, failOrReload]
  );

  // ---- reorder / move -------------------------------------------------------------------------

  const failureMessage = error =>
    error?.response?.status === CONFLICT_STATUS
      ? RELOADED_AFTER_CONFLICT
      : `${RELOADED_AFTER_FAILURE} (${describeSaveError(error)})`;

  // Reorders send the FULL id list; the screen updates at once and is corrected from the answer.
  const moveModule = useCallback(
    (moduleId, direction) =>
      enqueue(async () => {
        const snapshot = modulesRef.current;
        const index = snapshot.findIndex(module => module.id === moduleId);
        const reordered = moveInList(snapshot, index, direction);
        if (reordered === snapshot) return { ok: true };
        setModules(reordered);
        try {
          const { module_order: order } = bodyOf(await reorderModules({ id: programId, ids: reordered.map(module => module.id) }));
          setModules(previous => orderByIds(previous, order));
          setFailure(null);
          changed();
          return { ok: true };
        } catch (error) {
          return recoverByReloading(snapshot, failureMessage(error));
        }
      }),
    [enqueue, programId, setModules, changed, recoverByReloading]
  );

  const moveLessonWithinModule = useCallback(
    (moduleId, lessonId, direction) =>
      enqueue(async () => {
        const snapshot = modulesRef.current;
        const owner = snapshot.find(item => item.id === moduleId);
        const index = owner ? owner.lessons.findIndex(lesson => lesson.id === lessonId) : -1;
        if (index === -1) return { ok: true };
        const reordered = moveInList(owner.lessons, index, direction);
        if (reordered === owner.lessons) return { ok: true };
        setModules(mapModule(snapshot, moduleId, item => ({ ...item, lessons: reordered })));
        try {
          const { lesson_orders: orders } = bodyOf(
            await reorderLessons({ id: programId, moduleId, ids: reordered.map(lesson => lesson.id) })
          );
          setModules(previous =>
            mapModule(previous, moduleId, item => ({ ...item, lessons: orderByIds(item.lessons, orders[moduleId]) }))
          );
          setFailure(null);
          changed();
          return { ok: true };
        } catch (error) {
          return recoverByReloading(snapshot, failureMessage(error));
        }
      }),
    [enqueue, programId, setModules, changed, recoverByReloading]
  );

  const moveLessonToModule = useCallback(
    (lessonId, targetModuleId) =>
      enqueue(async () => {
        try {
          const { lesson, lesson_orders: orders } = bodyOf(
            await updateLesson({ id: programId, lessonId, payload: { module: targetModuleId } })
          );
          setModules(previous => {
            const moved = previous.flatMap(module => module.lessons).find(item => item.id === lessonId);
            return previous.map(module => {
              const rest = module.lessons.filter(item => item.id !== lessonId);
              if (module.id !== targetModuleId) return { ...module, lessons: rest };
              const withMoved = [...rest, { ...toLessonFormValues(lesson), questions: moved?.questions || [] }];
              return { ...module, lessons: orderByIds(withMoved, orders[targetModuleId]) };
            });
          });
          setFailure(null);
          changed();
          return { ok: true };
        } catch (error) {
          return failOrReload(error, 'Could not move the lesson');
        }
      }),
    [enqueue, programId, setModules, changed, failOrReload]
  );

  return {
    modules,
    seed,
    notice,
    failure,
    blockedNotices,
    isBusy: busyCount > 0,
    hasItem,
    dismissNotice,
    dismissFailure,
    dismissBlocked,
    reload,
    addModule,
    addLesson,
    saveModuleFields,
    saveLessonFields,
    saveQuiz,
    removeModule,
    removeLesson,
    moveModule,
    moveLessonWithinModule,
    moveLessonToModule,
  };
};

export default useCurriculum;
