'use client';
import { useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import { getLMSCategories, getLMSTags } from '@/services/private/lms';
import { addNewExpert } from '@/services/private/lms/experts';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import queryKeys from '@/utils/query-keys';

const ExpertForm = () => {
  const router = useRouter();
  const { data: categoriesResponse } = useQuery({
    queryFn: getLMSCategories,
    queryKey: [queryKeys.lmsCategories],
  });
  const { data: tagsResponse } = useQuery({
    queryFn: getLMSTags,
    queryKey: [queryKeys.lmsTags],
  });
  const { mutateAsync: addExpert } = useMutation({
    mutationFn: addNewExpert,
  });

  const initialValues = {
    name: '',
    email: '',
    title: '',
    description: '',
    file: null,
    categories: [],
    tags: [],
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required!'),
    email: Yup.string().email('Invalid email format').required('Required!'),
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    file: Yup.mixed().required('Required!'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
  });

  const categoriesOptions = useMemo(
    () =>
      categoriesResponse?.data?.data.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [categoriesResponse?.data?.data]
  );

  const tagsOptions = useMemo(
    () =>
      tagsResponse?.data?.data.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [tagsResponse?.data?.data]
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log(values);
      // const { data: response } = await addExpert({ payload: values });

      toast.success('Expert added successfully');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Expert Form">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="name" label="Name" placeholder="Name" required />
              </div>

              <div className="w-full xl:w-1/2">
                <FormikField type="email" name="email" label="Email" placeholder="Email" required />
              </div>
            </div>
            <FormikField name="title" label="Title" placeholder="Title" required />
            <FormikField name="description" label="Description" placeholder="Description" rows={5} required />
            <FormikMultiSelect
              name="categories"
              label="Categories"
              options={categoriesOptions}
              placeholder="Categories"
              required
            />
            <FormikMultiSelect name="tags" label="Tags" options={tagsOptions} placeholder="Tags" required />
            <FormikField
              type="file"
              name="file"
              label="File"
              value={null}
              className="transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:px-2.5 file:py-1 file:text-sm focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30 dark:file:text-white"
              onChange={e => setFieldValue(e.target.name, e.target.files[0])}
              required
            />
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ExpertForm;
