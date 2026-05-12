'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { getExpertsList, getExpertsListRows } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

const ExpertField = ({ name = 'expert', label = 'Expert', placeholder = 'Expert', ...props }) => {
  const { data: expertsResponse, isLoading } = useQuery({
    queryFn: () => getExpertsList({ limit: 500, offset: 0 }),
    queryKey: [queryKeys.lmsExperts, 'field-options'],
  });

  const expertOptions = useMemo(() => {
    const rows = getExpertsListRows(expertsResponse);
    return rows.map(option => ({
      label: `${option.first_name || ''} ${option.last_name || ''}`,
      value: option.id,
    }));
  }, [expertsResponse]);

  return (
    <FormikSelect {...props} name={name} loading={isLoading} label={label} placeholder={placeholder} options={expertOptions} />
  );
};

export default ExpertField;
