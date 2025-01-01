'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { getLMSCategories } from '@/services/private/lms';
import queryKeys from '@/utils/query-keys';

const CategoriesField = props => {
  const { data: categoriesResponse } = useQuery({
    queryFn: getLMSCategories,
    queryKey: [queryKeys.lmsCategories],
  });

  const categoriesOptions = useMemo(
    () =>
      categoriesResponse?.data?.data.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [categoriesResponse?.data?.data]
  );

  return <FormikMultiSelect {...props} options={categoriesOptions} />;
};

export default CategoriesField;
