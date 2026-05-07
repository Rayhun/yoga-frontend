'use client';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import {
  AccessSettingField,
  VisibilitySettingField,
  CategoriesField,
  TagsField,
} from '@/components/lms/general/fields';
import Button from '@/components/common/Button';
import ModuleFormContentOptions from './ModuleFormContentOptions';
import { addNewModule, updateExistingModule } from '@/services/private/lms/module';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { ACCESS_SETTING_OPTIONS, LMS_DOC_STATUS_OPTIONS } from '@/utils/options';
import { ONE_MB } from '@/utils/general';
import queryKeys from '@/utils/query-keys';

const normalizeBenefits = benefits => {
  if (!benefits) return '';

  if (Array.isArray(benefits)) {
    return benefits
      .flatMap(item => {
        if (typeof item === 'string') {
          const trimmed = item.trim();
          if (
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))
          ) {
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [trimmed.replace(/^"+|"+$/g, '')];
            }
          }
          return [trimmed];
        }
        return [String(item)];
      })
      .join('\n')
      .trim();
  }

  if (typeof benefits === 'string') {
    const trimmed = benefits.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeBenefits(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed.replace(/^"+|"+$/g, '');
  }

  return String(benefits);
};

const normalizeSelectValue = (value, options = []) => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'object') {
    const candidate = value.value ?? value.id ?? value.key ?? value.slug ?? value.name ?? value.label ?? value.title;
    return normalizeSelectValue(candidate, options);
  }

  const normalized = String(value).trim();
  if (!normalized) return '';

  const matchedOption = options.find(
    option =>
      String(option.value) === normalized || option.label?.toLowerCase() === normalized.toLowerCase()
  );

  return matchedOption ? matchedOption.value : normalized;
};

const ModuleForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addModule } = useMutation({
    mutationFn: addNewModule,
  });
  const { mutateAsync: updateModule } = useMutation({
    mutationFn: updateExistingModule,
  });

  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    benefits: normalizeBenefits(selected?.benefits),
    file: null,
    status: selected?.status || '',
    access_setting: normalizeSelectValue(selected?.access_setting, ACCESS_SETTING_OPTIONS),
    visibility_setting: selected?.visibility_setting || '',
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    module_content: (selected?.module || [{ content_id: '', content_type: '' }]).map(
      ({ content_id, content_type, order_by, order }) => ({
        content_id,
        content_type,
        order_by: order_by ?? order ?? '',
      })
    ),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    benefits: Yup.string().required('Required!'),
    file: Yup.mixed()
      .nullable()
      .test('fileRequired', 'Required!', value => (isEditMode ? true : Boolean(value)))
      .test(
        'fileType',
        'Unsupported file format. Only images are allowed.',
        value => !value || value.type.includes('image')
      )
      .test('fileSize', 'File size must be less than 5 MB', value => !value || value.size <= 5 * ONE_MB),
    status: Yup.string().required('Required!'),
    access_setting: Yup.string().required('Required!'),
    visibility_setting: Yup.string().required('Required!'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    module_content: Yup.array()
      .of(
        Yup.object({
          content_id: Yup.string().trim().required('Required!'),
          content_type: Yup.string().trim().required('Required!'),
          order_by: Yup.number('Must be a number').min(1, 'Must be a positive number').required('Required!'),
        })
      )
      .min(1, 'At least 1 option is required.')
      .test('uniqueOrder', 'Order numbers must be unique', function(value) {
        if (!value) return true;
        const orders = value
          .map(item => Number(item.order_by))
          .filter(orderBy => Number.isFinite(orderBy) && orderBy > 0);
        const uniqueOrders = new Set(orders);
        return orders.length === uniqueOrders.size;
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { file, ...payload } = values;
      const normalizedPayload = {
        ...payload,
        benefits: normalizeBenefits(payload.benefits),
        module_content: payload.module_content.map(({ content_id, content_type, order_by }) => ({
          content_id,
          content_type,
          order_by: Number(order_by),
        })),
      };
      let fileLink = selected?.image || '';
      if (file) {
        const { data: uploadedFile } = await uploadLMSFile({ file });
        fileLink = uploadedFile?.file_link || fileLink;
      }

      if (isEditMode) {
        await updateModule({
          payload: { id: selected.id, ...normalizedPayload, file: fileLink },
        });
        toast.success('Module updated successfully');
      } else {
        await addModule({ payload: { ...normalizedPayload, file: fileLink } });
        toast.success('Module added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsModules, selected.id] : [queryKeys.lmsModules] },
      ]);
      router.push('/portal/admin/lms/module');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Module Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={LMS_DOC_STATUS_OPTIONS}
                  required
                />
              </div>
            </div>
            <FormikRichTextEditor name="description" label="Description" placeholder="Description" rows={5} required />
            <FormikField name="benefits" label="Benefits" placeholder="Benefits" rows={5} required />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikDropzone
                  name="file"
                  label="File"
                  fileURLs={selected?.image ? [selected.image] : []}
                  Icon={FaRegFileImage}
                  required={!isEditMode}
                />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <AccessSettingField required />
              </div>
              <div className="w-full md:w-1/2">
                <VisibilitySettingField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <CategoriesField required />
              </div>
              <div className="md:w-1/2">
                <TagsField required />
              </div>
            </div>

            <div className="my-5 flex flex-col gap-3">
              <h3 className="font-bold text-2xl text-black dark:text-white">Module Content</h3>
              <FieldArray
                name="module_content"
                render={helpers => <ModuleFormContentOptions {...helpers} />}
              />
            </div>

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ModuleForm;
