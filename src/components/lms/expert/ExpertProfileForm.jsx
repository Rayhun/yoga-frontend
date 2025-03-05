'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRegFileImage } from 'react-icons/fa6';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { addNewExpert, updateExistingExpert } from '@/services/private/lms/expert';
import { toastApiError } from '@/utils/helpers';
import { CategoriesField, ExpertField, TagsField } from '@/components/lms/general/fields';
import { ONE_MB } from '@/utils/general';
import queryKeys from '@/utils/query-keys';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';

const ExpertProfileForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });
  const { mutateAsync: updateExpert } = useMutation({
    mutationFn: updateExistingExpert,
  });

  const initialValues = {
    name: selected?.name || '',
    email: selected?.email || '',
    title: selected?.title || '',
    description: selected?.description || '',
    file: null,
    categories: selected?.categories?.map(i => i.id) || [],
    tags: selected?.tags?.map(i => i.id) || [],
    languages: selected?.languages?.[0]?.split(',') || [],
    credentials: selected?.credentials?.[0]?.split(',') || [],
    available: selected?.available || false,
    experience: selected?.experience || 0,
    coaching_content: selected?.coaching_content?.split(',') || [],
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    email: Yup.string().email('Invalid email format').required('Required!'),
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    // categories: Yup.array()
    //   .of(Yup.number().required('Required!'))
    //   .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    credentials: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    coaching_content: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 language is required'),
    experience: Yup.number()
      .required('Experience is required')
      .integer('Experience must be a whole number')
      .min(1, 'Experience cannot be negative'),
    available: Yup.boolean(),
    // file: Yup.mixed()
    //   .required('Required!')
    //   .test(
    //     'fileType',
    //     'Unsupported file format. Only images are allowed.',
    //     value => value && value.type.includes('image')
    //   )
    //   .test('fileSize', 'File size must be less than 1 MB', value => value && value.size <= 1 * ONE_MB),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateExpert({ payload: { id: selected.id, ...values } });
      toast.success('Expert updated successfully');
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.teacherProfile, selected.id] : [queryKeys.teacherProfile] },
      ]);
      router.push('/portal/teacher/profile');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Expert Profile Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <FormikDropzone
              name="file"
              label="File"
              fileURLs={selected?.file ? [selected.file] : []}
              Icon={FaRegFileImage}
              required
            />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="name" label="Name" placeholder="Name" required />
              </div>

              <div className="w-full xl:w-1/2">
                <FormikField type="email" name="email" label="Email" placeholder="Email" disabled />

              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                  <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full xl:w-1/2">
              
                <FormikField
                  type="number"
                  name="experience"
                  label="Experience (Years)"
                  placeholder="Experience in Years"
                  required
                />
              </div>
            </div>
            <FormikField name="description" label="About" placeholder="About" rows={5} required />
            <TagsField name="tags" label="Coaching Areas" placeholder="Coaching Areas" required />
            <FormikSubmittableField name="credentials" label="Credentials" placeholder="Credentials" required />
            <FormikSubmittableField name="languages" label="Languages" placeholder="Languages" required />
            <FormikSubmittableField
              name="coaching_content"
              label="My Coaching Content"
              placeholder="My Coaching Content"
              required
            />

            <div className="my-5">
              <FormikSwitch name="available" label="Available for Coaching" />
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

export default ExpertProfileForm;
