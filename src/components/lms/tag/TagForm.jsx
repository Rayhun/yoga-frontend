'use client';
import { useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { addNewTag, getTagsList, updateExistingTag } from '@/services/private/lms/tag';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

const TagForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addTag } = useMutation({
    mutationFn: addNewTag,
  });
  const { mutateAsync: updateTag } = useMutation({
    mutationFn: updateExistingTag,
  });
  const {
    data: tagsResponse,
    failureReason,
  } = useQuery({
    queryFn: () => getTagsList({ limit: 1000, offset: 0 }),
    queryKey: [queryKeys.lmsTags, 'tag-form-options'],
  });
  useHandleApiResponse(failureReason);

  const tags = tagsResponse?.data?.data?.results || [];

  const namespaceOptions = useMemo(
    () => [...new Set(tags.map(item => item.namespace).filter(Boolean))],
    [tags]
  );
  const canonicalOptions = useMemo(
    () => [...new Set(tags.map(item => item.canonical_tag).filter(Boolean))],
    [tags]
  );
  const labelOptions = useMemo(
    () => [...new Set(tags.map(item => item.label).filter(Boolean))],
    [tags]
  );
  const namespaceSelectOptions = useMemo(
    () => namespaceOptions.map(option => ({ label: option, value: option })),
    [namespaceOptions]
  );
  const allAliases = useMemo(() => {
    const aliases = tags.flatMap(item =>
      String(item.alias || '')
        .split(',')
        .map(alias => alias.trim().toLowerCase())
        .filter(Boolean)
    );
    return [...new Set(aliases)];
  }, [tags]);

  const initialValues = {
    namespace: selected?.namespace || '',
    canonical_tag: selected?.canonical_tag || '',
    label: selected?.label || '',
    aliases: String(selected?.alias || '')
      .split(',')
      .map(alias => alias.trim())
      .filter(Boolean),
    is_active: selected?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    namespace: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Namespace cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    canonical_tag: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Canonical tag cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    label: Yup.string()
      .transform(value => (value ? value.trim() : value))
      .required('Required!')
      .test('no-whitespace-only', 'Label cannot be only spaces', value => {
        return value && value.length > 0;
      }),
    aliases: Yup.array()
      .of(Yup.string().trim().required('Alias cannot be empty'))
      .min(1, 'At least one alias is required')
      .test('unique-alias-in-db', 'One or more aliases already exist.', function (value) {
        const current = (value || []).map(v => String(v).trim().toLowerCase()).filter(Boolean);
        if (!current.length) return true;

        const selectedTagAliases = String(selected?.alias || '')
          .split(',')
          .map(alias => alias.trim().toLowerCase())
          .filter(Boolean);
        const allowedAliases = new Set(selectedTagAliases);

        return current.every(alias => !allAliases.includes(alias) || allowedAliases.has(alias));
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const normalize = value => String(value || '').trim().toLowerCase();
    const payload = {
      namespace: values.namespace.trim(),
      canonical_tag: values.canonical_tag.trim(),
      label: values.label.trim(),
      is_active: values.is_active,
      aliases: (values.aliases || [])
        .map(alias => alias.trim())
        .filter(Boolean),
    };

    try {
      if (isEditMode) {
        await updateTag({ payload: { id: selected.id, ...payload } });
        toast.success('Tag updated successfully');
      } else {
        const existingTag = tags.find(
          item =>
            normalize(item.namespace) === normalize(payload.namespace) &&
            normalize(item.canonical_tag) === normalize(payload.canonical_tag) &&
            normalize(item.label) === normalize(payload.label)
        );

        if (existingTag) {
          const existingAliases = new Set(
            String(existingTag.alias || '')
              .split(',')
              .map(alias => normalize(alias))
              .filter(Boolean)
          );
          const newAliases = payload.aliases.map(alias => normalize(alias)).filter(Boolean);
          const uniqueNewAliases = newAliases.filter(alias => !existingAliases.has(alias));

          if (!uniqueNewAliases.length) {
            toast.error('This tag with same namespace, canonical tag, label and alias already exists.');
            setSubmitting(false);
            return;
          }

          const mergedAliases = [...new Set([...existingAliases, ...uniqueNewAliases])];
          await updateTag({
            payload: {
              id: existingTag.id,
              namespace: existingTag.namespace,
              canonical_tag: existingTag.canonical_tag,
              label: existingTag.label,
              is_active: values.is_active,
              aliases: mergedAliases,
            },
          });
          toast.success('Alias added to existing tag successfully');
        } else {
          await addTag({ payload });
          toast.success('Tag added successfully');
        }
      }
      await queryClient.invalidateQueries({ queryKey: [queryKeys.lmsTags] });
      router.push('/portal/admin/lms/tag');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title={isEditMode ? 'Edit Tag' : 'Create Tag'}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => {
          const normalize = value => String(value || '').trim().toLowerCase();
          const canonicalSelectOptions = tags
            .filter(item => normalize(item.namespace) === normalize(values.namespace))
            .map(item => item.canonical_tag)
            .filter(Boolean)
            .filter((tag, index, arr) => arr.findIndex(v => normalize(v) === normalize(tag)) === index)
            .map(option => ({ label: option, value: option }));

          const selectedCanonical = tags.find(
            item =>
              normalize(item.namespace) === normalize(values.namespace) &&
              normalize(item.canonical_tag) === normalize(values.canonical_tag)
          );
          const isLabelLocked = Boolean(selectedCanonical);

          const isNamespaceNew =
            Boolean(values.namespace.trim()) &&
            !namespaceOptions.some(option => normalize(option) === normalize(values.namespace));
          const isCanonicalNew =
            Boolean(values.canonical_tag.trim()) &&
            !canonicalOptions.some(option => normalize(option) === normalize(values.canonical_tag));
          const isLabelNew =
            Boolean(values.label.trim()) &&
            !labelOptions.some(option => normalize(option) === normalize(values.label));

          return (
          <Form className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-violet-50 via-white to-cyan-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Tag Management</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {isEditMode ? 'Refine your tag details' : 'Create a clean and searchable tag'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Keep naming clear and consistent so learners can discover content faster.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="w-full">
                  <FormikSelect
                    name="namespace"
                    label="Namespace"
                    placeholder="e.g. wellness"
                    required
                    options={namespaceSelectOptions}
                    freeSolo
                  />
                  {isNamespaceNew ? <p className="mt-1 text-xs text-primary">New namespace</p> : null}
                </div>

                <div className="w-full">
                  <FormikSelect
                    name="canonical_tag"
                    label="Canonical Tag"
                    placeholder="e.g. mindful_breathing"
                    required
                    options={canonicalSelectOptions}
                    freeSolo
                    onChange={newCanonical => {
                      const matchedTag = tags.find(
                        item =>
                          normalize(item.namespace) === normalize(values.namespace) &&
                          normalize(item.canonical_tag) === normalize(newCanonical)
                      );
                      if (matchedTag?.label) {
                        setFieldValue('label', matchedTag.label, true);
                      } else {
                        setFieldValue('label', '', true);
                      }
                    }}
                  />
                  {isCanonicalNew ? <p className="mt-1 text-xs text-primary">New canonical tag</p> : null}
                </div>

                <div className="w-full">
                  <FormikField
                    name="label"
                    label="Display Label"
                    placeholder="e.g. Mindful Breathing"
                    required
                    disabled={isLabelLocked}
                  />
                  {isLabelLocked ? (
                    <p className="mt-1 text-xs text-gray-500">
                      Existing canonical tag selected, display label is auto-filled.
                    </p>
                  ) : null}
                  {isLabelNew ? <p className="mt-1 text-xs text-primary">New display label</p> : null}
                </div>

                <div className="w-full">
                  <FormikMultiSelect
                    name="aliases"
                    label="Aliases"
                    placeholder="Type alias and press Enter"
                    required
                    options={[]}
                    freeSolo
                  />
                  <p className="mt-1 text-xs text-gray-500">Add alias as chips. Press Enter after each alias.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 md:col-span-2">
                  <FormikSwitch name="is_active" label="Keep this tag active for learners" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outlined"
                size="2xl"
                className="min-w-28 rounded-xl px-6"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button type="submit" size="2xl" className="min-w-36 rounded-xl px-8" isLoading={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </Form>
        );
        }}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default TagForm;
