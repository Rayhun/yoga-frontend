'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import FormikField from '@/components/common/form/formik/FormikField';
import CurriculumModuleFields from '@/components/certification/builder/sections/CurriculumModuleFields';
import { getModuleProblem, toModuleFieldsPayload } from '@/components/certification/builder/sections/curriculumFields';
import { PANE_STATUS, combinePaneStates } from './paneState';
import usePaneAutosave from './usePaneAutosave';

/**
 * Edit pane for ONE module: title, description, when it unlocks (+ the date, for "on a date") and image —
 * never more than five inputs. Text saves on blur and discrete controls save at once, each as a PATCH
 * naming only this module. The values are seeded once when the pane opens (the section remounts it with
 * a new `key` on selection or reload), so a save's response never overwrites what is being typed.
 */
const ModuleFold = ({ module, disabled = false, saveFields, hasItem, registerPane, onState }) => {
  const [initialValues] = useState(() => ({ modules: [module] }));
  const [problem, setProblem] = useState(null);
  const problemRef = useRef(null);

  const fields = usePaneAutosave({
    save: payload => saveFields(module.id, payload),
    baseline: toModuleFieldsPayload(module),
    exists: () => hasItem('module', module.id),
  });
  const { notifyBlur, flush: flushFields, discard, retry, status, errorMessage, canRetry } = fields;

  const state = useMemo(
    () =>
      combinePaneStates([
        problem ? { status: PANE_STATUS.pending, message: problem } : null,
        { status, message: errorMessage, canRetry, retry },
      ]),
    [problem, status, errorMessage, canRetry, retry]
  );
  useEffect(() => {
    onState(state);
  }, [onState, state]);

  const flush = useCallback(async () => {
    if (problemRef.current) throw new Error(problemRef.current);
    await flushFields();
  }, [flushFields]);
  useEffect(() => {
    registerPane({ flush, discard });
    return () => registerPane(null);
  }, [registerPane, flush, discard]);

  const handleSave = useCallback(
    next => {
      const nextProblem = getModuleProblem(next);
      problemRef.current = nextProblem;
      setProblem(nextProblem);
      if (!nextProblem) notifyBlur(toModuleFieldsPayload(next));
    },
    [notifyBlur]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {({ values, setFieldValue }) => {
        const current = values.modules[0];
        const onModuleChange = patch => {
          const next = { ...current, ...patch };
          setFieldValue('modules[0]', next);
          handleSave(next);
        };
        return (
          <Form className="flex flex-col gap-3" onBlur={() => handleSave(current)} onSubmit={event => event.preventDefault()}>
            <FormikField name="modules[0].title" label="Module title" placeholder="e.g. Module 1 — Foundations" required disabled={disabled} />
            <CurriculumModuleFields mi={0} module={current} disabled={disabled} onModuleChange={onModuleChange} getBlockReason={() => null} />
          </Form>
        );
      }}
    </Formik>
  );
};

export default ModuleFold;
