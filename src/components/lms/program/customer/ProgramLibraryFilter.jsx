'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { toastApiError } from '@/utils/helpers';

const ProgramLibraryFilter = ({
  filters = {},
  onApplyFilter = () => null,
  categoryOptions = [],
  tagOptions = [],
}) => {
  const categoriesOptions = categoryOptions;
  const tagsOptions = tagOptions;

  const initialValues = {
    categories: filters.categories || [],
    tags: filters.tags || [],
  };

  const validationSchema = Yup.object({
    categories: Yup.array(),
    tags: Yup.array(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      onApplyFilter(values);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-7">
          <div className="flex flex-col gap-x-6 gap-y-3 text-left md:flex-row">
            <div className="w-full xl:w-1/2">
              <FormikMultiSelect
                name="categories"
                label="Categories"
                placeholder="Categories"
                options={categoriesOptions}
                disablePortal
              />
            </div>

            <div className="w-full xl:w-1/2">
              <FormikMultiSelect
                name="tags"
                label="Tags"
                placeholder="Tags"
                options={tagsOptions}
                disablePortal
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="self-center !px-5" isLoading={isSubmitting}>
            {isSubmitting ? 'Applying...' : 'Apply'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ProgramLibraryFilter;
