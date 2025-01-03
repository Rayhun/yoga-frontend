'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { getLMSTags } from '@/services/private/lms';
import queryKeys from '@/utils/query-keys';

const TagsField = ({ name = 'tags', label = 'Tags', placeholder = 'Tags', ...props }) => {
  const { data: tagsResponse } = useQuery({
    queryFn: getLMSTags,
    queryKey: [queryKeys.lmsTags],
  });

  const tagsOptions = useMemo(
    () =>
      tagsResponse?.data?.data.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [tagsResponse?.data?.data]
  );

  return (
    <FormikMultiSelect {...props} name={name} label={label} placeholder={placeholder} options={tagsOptions} />
  );
};

export default TagsField;
