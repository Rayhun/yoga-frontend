'use client';
import { useEffect, useMemo, useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import Button from '@/components/common/Button';
import {
  createOnboardingV2Question,
  getOnboardingV2QuestionsList,
  updateOnboardingV2Question,
} from '@/services/private/onboarding/quiz-v2';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import queryKeys from '@/utils/query-keys';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

const VARIANT_TYPE_OPTIONS = [
  { label: 'Single select (no image)', value: 'single_select' },
  { label: 'Single select (with image)', value: 'single_select_image' },
];

function variantTypeLabel(type) {
  return VARIANT_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type ?? '—';
}

function PreviewField({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2.5 last:border-b-0 dark:border-strokedark sm:flex-row sm:items-start sm:gap-4">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2 sm:w-36">
        {label}
      </p>
      <div className="min-w-0 flex-1 break-words text-sm text-slate-900 dark:text-bodydark1">{children}</div>
    </div>
  );
}

function PreviewJsonBlock({ text }) {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return <span className="text-slate-400 dark:text-bodydark2">—</span>;
  return (
    <pre className="max-h-36 overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2.5 font-mono text-xs leading-relaxed text-slate-700 dark:border-strokedark dark:bg-strokedark dark:text-bodydark1">
      {t}
    </pre>
  );
}

function OnboardingQuizPreview({ values }) {
  const variants = values.variants || [];
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 p-6 shadow-sm dark:border-strokedark dark:from-meta-4 dark:via-boxdark dark:to-boxdark md:p-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Question overview</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-bodydark2">
          Summary of step 1 — confirm identity and ordering.
        </p>
        <div className="mt-4">
          <PreviewField label="Key">{values.key || '—'}</PreviewField>
          <PreviewField label="Tag text">{values.tag_text || '—'}</PreviewField>
          <PreviewField label="Tag emoji">{values.tag_emoji?.trim() ? values.tag_emoji : '—'}</PreviewField>
          <PreviewField label="Sets key">{values.sets_key || '—'}</PreviewField>
          <PreviewField label="Branch rule">{values.branch_rule || '—'}</PreviewField>
          <PreviewField label="Order">{values.order ?? '—'}</PreviewField>
          <PreviewField label="Active">{values.is_active ? 'Yes' : 'No'}</PreviewField>
        </div>
      </div>

      {variants.map((v, vi) => (
        <div
          key={vi}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-strokedark dark:bg-boxdark md:p-8"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 dark:border-strokedark">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">
              {vi + 1}
            </span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Variant {vi + 1}</h3>
            <span className="font-mono text-sm text-teal-700 dark:text-teal-400">{v.variant_id || '—'}</span>
          </div>
          <div className="mt-4">
            <PreviewField label="Type">{variantTypeLabel(v.type)}</PreviewField>
            <PreviewField label="Question">{v.question_text || '—'}</PreviewField>
            <PreviewField label="Sub text">{v.sub_text?.trim() ? v.sub_text : '—'}</PreviewField>
            <PreviewField label="Variant order">{v.order ?? '—'}</PreviewField>
            <PreviewField label="Default">{v.is_default ? 'Yes' : 'No'}</PreviewField>
            <PreviewField label="Variant active">{v.is_active ? 'Yes' : 'No'}</PreviewField>
            <PreviewField label="show_if (JSON)">
              <PreviewJsonBlock text={v.show_if_json} />
            </PreviewField>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-strokedark">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Answer options</h4>
            <ul className="mt-3 flex flex-col gap-4">
              {(v.options || []).map((opt, oi) => (
                <li
                  key={oi}
                  className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-strokedark dark:bg-meta-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">
                    Option {oi + 1}
                  </p>
                  <div className="mt-2 space-y-0">
                    <PreviewField label="Value">{opt.value || '—'}</PreviewField>
                    <PreviewField label="Label">{opt.label || '—'}</PreviewField>
                    <PreviewField label="Sub label">{opt.sub_label?.trim() ? opt.sub_label : '—'}</PreviewField>
                    <PreviewField label="Emoji">{opt.emoji?.trim() ? opt.emoji : '—'}</PreviewField>
                    <PreviewField label="Order">{opt.order ?? '—'}</PreviewField>
                    <PreviewField label="sets (JSON)">
                      <PreviewJsonBlock text={opt.sets_json} />
                    </PreviewField>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

const defaultOption = () => ({
  value: '',
  label: '',
  sub_label: '',
  emoji: '',
  sets_json: '',
  order: 0,
});

const defaultVariant = () => ({
  variant_id: '',
  question_text: '',
  sub_text: '',
  type: 'single_select',
  is_default: true,
  show_if_json: '',
  order: 0,
  is_active: true,
  options: [defaultOption(), defaultOption()],
});

const mapVariantFromApi = v => ({
  variant_id: v.variant_id ?? '',
  question_text: v.question_text ?? '',
  sub_text: v.sub_text ?? '',
  type: v.type ?? 'single_select',
  is_default: Boolean(v.is_default),
  show_if_json: v.show_if == null ? '' : JSON.stringify(v.show_if, null, 2),
  order: v.order ?? 0,
  is_active: v.is_active !== false,
  options:
    (v.options?.length ? v.options : [defaultOption(), defaultOption()]).map(o => ({
      value: o.value ?? '',
      label: o.label ?? '',
      sub_label: o.sub_label ?? '',
      emoji: o.emoji ?? '',
      sets_json:
        o.sets && typeof o.sets === 'object' && Object.keys(o.sets).length
          ? JSON.stringify(o.sets, null, 2)
          : '',
      order: o.order ?? 0,
    })),
});

function buildPayload(values) {
  const variants = values.variants.map((v, vi) => {
    let show_if = null;
    const rawShow = typeof v.show_if_json === 'string' ? v.show_if_json.trim() : '';
    if (rawShow) {
      try {
        show_if = JSON.parse(rawShow);
        if (typeof show_if !== 'object' || show_if === null || Array.isArray(show_if)) {
          throw new Error('must be a JSON object');
        }
      } catch {
        throw new Error(`Variant ${vi + 1}: show_if must be empty or valid JSON object.`);
      }
    }

    const options = v.options.map((o, oi) => {
      let sets = {};
      const rawSets = typeof o.sets_json === 'string' ? o.sets_json.trim() : '';
      if (rawSets) {
        try {
          sets = JSON.parse(rawSets);
          if (typeof sets !== 'object' || sets === null || Array.isArray(sets)) {
            throw new Error('must be a JSON object');
          }
        } catch {
          throw new Error(
            `Option ${oi + 1} in variant ${vi + 1}: sets must be empty or valid JSON object.`
          );
        }
      }
      return {
        value: o.value,
        label: o.label,
        sub_label: o.sub_label || '',
        emoji: o.emoji || '',
        sets,
        order: Number(o.order) || 0,
      };
    });

    return {
      variant_id: v.variant_id,
      question_text: v.question_text,
      sub_text: v.sub_text || '',
      type: v.type,
      is_default: Boolean(v.is_default),
      show_if,
      order: Number(v.order) || 0,
      is_active: Boolean(v.is_active),
      options,
    };
  });

  return {
    key: values.key.trim(),
    tag_text: values.tag_text.trim(),
    tag_emoji: (values.tag_emoji || '').trim(),
    sets_key: values.sets_key.trim(),
    branch_rule: values.branch_rule.trim(),
    order: Number(values.order) || 0,
    is_active: Boolean(values.is_active),
    variants,
  };
}

const STEP_LABELS = ['Question setup', 'Variants & answers', 'Review & save'];
const LAST_STEP_INDEX = STEP_LABELS.length - 1;

function buildValidationSchemas({ existingQuestions, currentQuestionId, remoteOrderCheckEnabled }) {
  const questionOrderSchema = Yup.number()
    .required('Required')
    .test(
      'unique-question-order',
      'This order is already used by another onboarding step. Choose a different order.',
      function orderTakenTest(value) {
        if (!remoteOrderCheckEnabled) return true;
        const num = Number(value);
        if (Number.isNaN(num)) return true;
        const taken = existingQuestions.some(q => {
          if (currentQuestionId != null && String(q.id) === String(currentQuestionId)) return false;
          return Number(q.order) === num;
        });
        return !taken;
      }
    );

  const optionSchema = Yup.object({
    value: Yup.string().required('Required'),
    label: Yup.string().required('Required'),
    sub_label: Yup.string(),
    emoji: Yup.string(),
    sets_json: Yup.string(),
    order: Yup.number(),
  });

  const variantSchema = Yup.object({
    variant_id: Yup.string().required('Required'),
    question_text: Yup.string().required('Required'),
    sub_text: Yup.string(),
    type: Yup.string()
      .oneOf(['single_select', 'single_select_image'])
      .required('Required'),
    is_default: Yup.boolean(),
    show_if_json: Yup.string(),
    order: Yup.number(),
    is_active: Yup.boolean(),
    options: Yup.array()
      .of(optionSchema)
      .min(1, 'At least one option')
      .test(
        'unique-option-orders',
        '',
        function uniqueOptionOrders(options) {
          if (!options?.length) return true;
          const orders = options.map(o => Number(o.order));
          const byOrder = new Map();
          orders.forEach((o, i) => {
            if (!byOrder.has(o)) byOrder.set(o, []);
            byOrder.get(o).push(i);
          });
          for (const [, indices] of byOrder) {
            if (indices.length > 1) {
              const idx = indices[1];
              return this.createError({
                path: `${this.path}[${idx}].order`,
                message:
                  'This order matches another option in this variant. Use a different order for each option.',
              });
            }
          }
          return true;
        }
      ),
  });

  const validationSchema = Yup.object({
    key: Yup.string().required('Required').max(20),
    tag_text: Yup.string().required('Required').max(100),
    tag_emoji: Yup.string().max(10),
    sets_key: Yup.string().required('Required').max(100),
    branch_rule: Yup.string().required('Required').max(50),
    order: questionOrderSchema,
    is_active: Yup.boolean(),
    variants: Yup.array()
      .of(variantSchema)
      .min(1, 'Add at least one variant')
      .test(
        'unique-variant-orders',
        '',
        function uniqueVariantOrders(variants) {
          if (!variants?.length) return true;
          const orders = variants.map(v => Number(v.order));
          const byOrder = new Map();
          orders.forEach((o, i) => {
            if (!byOrder.has(o)) byOrder.set(o, []);
            byOrder.get(o).push(i);
          });
          for (const [, indices] of byOrder) {
            if (indices.length > 1) {
              const idx = indices[1];
              return this.createError({
                path: `${this.path}[${idx}].order`,
                message:
                  'This order matches another variant. Use a different order for each variant.',
              });
            }
          }
          return true;
        }
      ),
  });

  const step1ValidationSchema = Yup.object({
    key: Yup.string().required('Required').max(20),
    tag_text: Yup.string().required('Required').max(100),
    tag_emoji: Yup.string().max(10),
    sets_key: Yup.string().required('Required').max(100),
    branch_rule: Yup.string().required('Required').max(50),
    order: questionOrderSchema,
    is_active: Yup.boolean(),
  });

  return { validationSchema, step1ValidationSchema };
}

async function validateStep1(values, setErrors, setTouched, step1ValidationSchema) {
  try {
    await step1ValidationSchema.validate(values, { abortEarly: false });
    setErrors({});
    return true;
  } catch (err) {
    const errors = {};
    const touched = {};
    if (err.inner?.length) {
      err.inner.forEach(e => {
        if (e.path) {
          errors[e.path] = e.message;
          touched[e.path] = true;
        }
      });
    } else if (err.path) {
      errors[err.path] = err.message;
      touched[err.path] = true;
    }
    setErrors(errors);
    setTouched(prev => ({ ...prev, ...touched }));
    return false;
  }
}

async function validateFullForm(values, setErrors, setTouched, validationSchema) {
  try {
    await validationSchema.validate(values, { abortEarly: false });
    setErrors({});
    return true;
  } catch (err) {
    const errors = {};
    const touched = {};
    if (err.inner?.length) {
      err.inner.forEach(e => {
        if (e.path) {
          errors[e.path] = e.message;
          touched[e.path] = true;
        }
      });
    } else if (err.path) {
      errors[err.path] = err.message;
      touched[err.path] = true;
    }
    setErrors(errors);
    setTouched(prev => ({ ...prev, ...touched }));
    return false;
  }
}

const OnboardingQuizForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const [step, setStep] = useState(0);
  /** Indices of variants whose body is collapsed (header stays visible). */
  const [collapsedVariantIndices, setCollapsedVariantIndices] = useState(() => new Set());

  useEffect(() => {
    setStep(0);
    setCollapsedVariantIndices(new Set());
  }, [selected?.id]);

  const toggleVariantCollapsed = vi => {
    setCollapsedVariantIndices(prev => {
      const next = new Set(prev);
      if (next.has(vi)) next.delete(vi);
      else next.add(vi);
      return next;
    });
  };

  const removeVariantAt = (removeFn, vi) => {
    removeFn(vi);
    setCollapsedVariantIndices(prev => {
      const next = new Set();
      prev.forEach(i => {
        if (i < vi) next.add(i);
        else if (i > vi) next.add(i - 1);
      });
      return next;
    });
  };

  const ORDER_CHECK_FETCH_LIMIT = 500;

  const { data: questionsListResponse, isFetched: questionsListFetched } = useQuery({
    queryKey: [queryKeys.onboardingQuizV2, 'order-validation'],
    queryFn: () => getOnboardingV2QuestionsList({ limit: ORDER_CHECK_FETCH_LIMIT, offset: 0 }),
    staleTime: 30_000,
  });

  const existingQuestions = questionsListResponse?.data?.data?.results ?? [];

  const { validationSchema, step1ValidationSchema } = useMemo(
    () =>
      buildValidationSchemas({
        existingQuestions,
        currentQuestionId: selected?.id,
        remoteOrderCheckEnabled: questionsListFetched,
      }),
    [existingQuestions, selected?.id, questionsListFetched]
  );

  const { mutateAsync: createQuestion } = useMutation({
    mutationFn: createOnboardingV2Question,
  });
  const { mutateAsync: updateQuestion } = useMutation({
    mutationFn: updateOnboardingV2Question,
  });

  const initialValues = {
    key: selected?.key ?? '',
    tag_text: selected?.tag_text ?? '',
    tag_emoji: selected?.tag_emoji ?? '',
    sets_key: selected?.sets_key ?? '',
    branch_rule: selected?.branch_rule ?? '',
    order: selected?.order ?? 0,
    is_active: selected?.is_active !== false,
    variants:
      selected?.variants?.length > 0 ? selected.variants.map(mapVariantFromApi) : [defaultVariant()],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = buildPayload(values);
      if (isEditMode) {
        await updateQuestion({ payload: { id: selected.id, ...payload } });
        toast.success('Question updated successfully');
      } else {
        await createQuestion({ payload });
        toast.success('Question created successfully');
      }
      await queryClient.invalidateQueries({ queryKey: [queryKeys.onboardingQuizV2] });
      if (isEditMode) {
        await queryClient.invalidateQueries({ queryKey: [queryKeys.onboardingQuizV2, selected.id] });
      }
      router.push('/portal/admin/onboarding/quiz');
    } catch (error) {
      if (error?.message && !error?.response) {
        toast.error(error.message);
      } else {
        toastApiError(error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title={isEditMode ? 'Edit onboarding question' : 'Add onboarding question'}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          if (step !== LAST_STEP_INDEX) {
            helpers.setSubmitting(false);
            return;
          }
          await handleSubmit(values, helpers);
        }}
        enableReinitialize
      >
        {({ isSubmitting, values, setErrors, setTouched }) => (
          <Form
            className="mx-auto flex w-full max-w-6xl flex-col gap-8"
            onSubmitCapture={e => {
              if (step !== LAST_STEP_INDEX) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              const target = e.target;
              if (target && target.tagName === 'TEXTAREA') return;
              if (step !== LAST_STEP_INDEX) {
                e.preventDefault();
              }
            }}
          >
            <nav
              aria-label="Form steps"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {STEP_LABELS.map((label, i) => {
                  const done = i < step;
                  const current = i === step;
                  return (
                    <li key={label} className="flex flex-1 items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          current
                            ? 'bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2 ring-offset-white dark:ring-offset-boxdark'
                            : done
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                              : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark2'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-bodydark2">
                          Step {i + 1}
                        </p>
                        <p
                          className={`truncate text-sm font-semibold ${
                            current ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-bodydark2'
                          }`}
                        >
                          {label}
                        </p>
                      </div>
                      {i < STEP_LABELS.length - 1 ? (
                        <span
                          className="mx-2 hidden h-px flex-1 bg-slate-200 sm:block dark:bg-strokedark"
                          aria-hidden
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {step === 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded-3xl border border-teal-100/80 bg-gradient-to-br from-teal-50 via-emerald-50/70 to-cyan-50/60 p-6 shadow-lg dark:border-strokedark dark:from-meta-4 dark:via-boxdark dark:to-boxdark lg:col-span-1 lg:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
                    Onboarding flow
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900 dark:text-white">
                    {isEditMode ? 'Update this quiz step' : 'Build a new quiz question'}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-bodydark2">
                    Start with identity and ordering. You will add variants and answers in the next step.
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-bodydark1">
                    <li className="flex gap-2">
                      <span className="text-teal-600 dark:text-teal-400">✓</span>
                      One stable key per question (locked after create).
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 dark:text-teal-400">✓</span>
                      Tag and branch metadata define how this step fits the funnel.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 dark:text-teal-400">✓</span>
                      Next: variants and answers, then a final review before saving.
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-strokedark dark:bg-boxdark lg:col-span-2 lg:p-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Question settings</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-bodydark2">
                    Identity and ordering for this step in the onboarding sequence.
                  </p>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <FormikField
                      name="key"
                      label="Key"
                      placeholder='e.g. "q1"'
                      required
                      disabled={isEditMode}
                    />
                    <FormikField name="tag_text" label="Tag text" placeholder="Section label" required />
                    <FormikField name="tag_emoji" label="Tag emoji" placeholder="👋" />
                    <FormikField name="sets_key" label="Sets key" placeholder="e.g. age_group" required />
                    <FormikField name="branch_rule" label="Branch rule" placeholder="e.g. linear" required />
                    <FormikField name="order" label="Order" type="number" required />
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-strokedark dark:bg-meta-4 md:col-span-2">
                      <FormikCheckbox name="is_active" label="Question is active in the flow" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
            <FieldArray name="variants">
              {({ push, remove }) => (
                <section className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Variants</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-bodydark2">
                        Each variant is a version of the question (copy, type, or conditional rule).
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => push(defaultVariant())}>
                      Add variant
                    </Button>
                  </div>

                  {values.variants.map((variantRow, vi) => {
                    const isCollapsed = collapsedVariantIndices.has(vi);
                    const summaryRaw =
                      (variantRow.variant_id && String(variantRow.variant_id).trim()) ||
                      (variantRow.question_text && String(variantRow.question_text).trim()) ||
                      '';
                    const summaryPreview =
                      summaryRaw.length > 48 ? `${summaryRaw.slice(0, 48)}…` : summaryRaw;
                    return (
                    <div
                      key={vi}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md dark:border-strokedark dark:bg-boxdark"
                    >
                      <div className="flex flex-wrap items-stretch justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/40 px-3 py-3 dark:border-strokedark dark:from-meta-4 dark:to-meta-4 sm:px-5 sm:py-4">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left outline-none transition hover:bg-white/40 focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-white/5 dark:focus-visible:ring-teal-500"
                          onClick={() => toggleVariantCollapsed(vi)}
                          aria-expanded={!isCollapsed}
                          aria-controls={`variant-panel-${vi}`}
                          id={`variant-header-${vi}`}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
                            {vi + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0">
                                <span>Variant {vi + 1}</span>
                                {summaryPreview ? (
                                  <span className="truncate font-normal font-mono text-sm text-slate-600 dark:text-bodydark2">
                                    · {summaryPreview}
                                  </span>
                                ) : null}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-bodydark2">
                              {isCollapsed ? 'Collapsed — click to expand' : 'Expanded — click to minimize'}
                            </p>
                          </div>
                          <span className="shrink-0 text-slate-600 dark:text-bodydark1" aria-hidden>
                            {isCollapsed ? <MdExpandMore size={24} /> : <MdExpandLess size={24} />}
                          </span>
                        </button>
                        {values.variants.length > 1 ? (
                          <div className="flex shrink-0 items-center self-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={e => {
                                e.stopPropagation();
                                removeVariantAt(remove, vi);
                              }}
                            >
                              Remove variant
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      {!isCollapsed ? (
                      <div
                        id={`variant-panel-${vi}`}
                        role="region"
                        aria-labelledby={`variant-header-${vi}`}
                        className="space-y-6 p-5 md:p-6"
                      >
                        <div className="grid gap-5 md:grid-cols-2">
                          <FormikField
                            name={`variants[${vi}].variant_id`}
                            label="Variant ID"
                            placeholder="e.g. q1_a"
                            required
                          />
                          <FormikSelect
                            name={`variants[${vi}].type`}
                            label="Type"
                            options={VARIANT_TYPE_OPTIONS}
                            required
                          />
                          <div className="md:col-span-2">
                            <FormikField
                              name={`variants[${vi}].question_text`}
                              label="Question text"
                              placeholder="Main question copy"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <FormikField
                              name={`variants[${vi}].sub_text`}
                              label="Sub text"
                              placeholder="Optional subtitle"
                            />
                          </div>
                          <FormikField name={`variants[${vi}].order`} label="Variant order" type="number" />
                          <div className="flex flex-wrap items-center gap-6">
                            <FormikCheckbox name={`variants[${vi}].is_default`} label="Default variant" />
                            <FormikCheckbox name={`variants[${vi}].is_active`} label="Variant active" />
                          </div>
                          <div className="md:col-span-2">
                            <FormikField
                              name={`variants[${vi}].show_if_json`}
                              label="show_if (JSON, optional)"
                              placeholder='{"age_group": "30-39"} or leave empty'
                              rows={3}
                            />
                          </div>
                        </div>

                        <FieldArray name={`variants[${vi}].options`}>
                          {({ push: pushOpt, remove: removeOpt }) => (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-strokedark dark:bg-meta-4 md:p-5">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h4 className="font-semibold text-slate-900 dark:text-white">Answer options</h4>
                                  <p className="text-xs text-slate-600 dark:text-bodydark2">
                                    Values shown to users and metadata for routing.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => pushOpt(defaultOption())}
                                >
                                  Add option
                                </Button>
                              </div>

                              <div className="mt-4 flex flex-col gap-4">
                                {values.variants[vi].options.map((__, oi) => (
                                  <div
                                    key={oi}
                                    className="rounded-2xl border border-white bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark md:p-5"
                                  >
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                      <span className="text-sm font-medium text-slate-700 dark:text-bodydark1">
                                        Option {oi + 1}
                                      </span>
                                      {values.variants[vi].options.length > 1 ? (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeOpt(oi)}
                                        >
                                          Remove
                                        </Button>
                                      ) : null}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <FormikField
                                        name={`variants[${vi}].options[${oi}].value`}
                                        label="Value"
                                        required
                                      />
                                      <FormikField
                                        name={`variants[${vi}].options[${oi}].label`}
                                        label="Label"
                                        required
                                      />
                                      <FormikField name={`variants[${vi}].options[${oi}].sub_label`} label="Sub label" />
                                      <FormikField name={`variants[${vi}].options[${oi}].emoji`} label="Emoji" />
                                      <FormikField
                                        name={`variants[${vi}].options[${oi}].order`}
                                        label="Order"
                                        type="number"
                                      />
                                      <div className="md:col-span-2">
                                        <FormikField
                                          name={`variants[${vi}].options[${oi}].sets_json`}
                                          label="sets (JSON)"
                                          placeholder="{}"
                                          rows={2}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </FieldArray>
                      </div>
                      ) : null}
                    </div>
                  );
                  })}
                </section>
              )}
            </FieldArray>
            ) : null}

            {step === 2 ? (
              <section className="flex flex-col gap-4">
                <div className="rounded-2xl border border-teal-200 bg-teal-50/60 px-4 py-3 dark:border-teal-900/40 dark:bg-teal-950/20">
                  <p className="text-sm font-medium text-teal-900 dark:text-teal-200">Final review</p>
                  <p className="mt-1 text-sm text-teal-800/90 dark:text-teal-300/90">
                    Check everything below. Use Back to edit earlier steps. Saving will send this data to the server.
                  </p>
                </div>
                <OnboardingQuizPreview values={values} />
              </section>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500 dark:text-bodydark2">
                Step {step + 1} of {STEP_LABELS.length}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                {step > 0 ? (
                  <Button
                    type="button"
                    size="2xl"
                    variant="secondary"
                    className="rounded-xl px-6"
                    onClick={() => setStep(s => s - 1)}
                  >
                    Back
                  </Button>
                ) : null}
                {step === 0 ? (
                  <Button
                    type="button"
                    size="2xl"
                    className="min-w-36 rounded-xl px-8"
                    onClick={async e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const ok = await validateStep1(values, setErrors, setTouched, step1ValidationSchema);
                      if (ok) setStep(1);
                    }}
                  >
                    Next: variants
                  </Button>
                ) : null}
                {step === 1 ? (
                  <Button
                    type="button"
                    size="2xl"
                    className="min-w-40 rounded-xl px-8"
                    onClick={async e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const ok = await validateFullForm(values, setErrors, setTouched, validationSchema);
                      if (ok) setStep(2);
                    }}
                  >
                    Next: review
                  </Button>
                ) : null}
                {step === 2 ? (
                  <Button type="submit" size="2xl" className="min-w-40 rounded-xl px-8" isLoading={isSubmitting}>
                    {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create question'}
                  </Button>
                ) : null}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default OnboardingQuizForm;
