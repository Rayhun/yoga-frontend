'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import useUpdateEffect from '@/hooks/useUpdateEffect';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikField from '@/components/common/form/formik/FormikField';
import { getProgramContentOptions } from '@/services/private/lms/program';
import { PROGRAM_TYPE_OPTIONS } from '@/utils/options';

const ProgramFormContentOption = ({ values, name, onRemove }) => {
  const [contentOptions, setContentOptions] = useState([]);

  const { mutateAsync: getContentOptions } = useMutation({
    mutationFn: getProgramContentOptions,
  });

  useUpdateEffect(() => {
    getContentOptions({ type: values.content_type }).then(contentOptionsResponse => {
      const modifiedOptionsData = contentOptionsResponse?.data?.map(i => ({
        label: i.title,
        value: i.id,
      }));

      setContentOptions(modifiedOptionsData);
    });
  }, [values.content_type]);

  return (
    <div className="flex gap-x-6 gap-y-1 items-center overflow-auto">
      <div className="w-[30%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_type`}
          label="Type"
          placeholder="Type"
          options={PROGRAM_TYPE_OPTIONS}
          onChange={() => setFieldValue(`${name}.content_id`, '')}
          required
        />
      </div>
      <div className="w-[30%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_id`}
          label="Content"
          placeholder="Content"
          options={contentOptions}
          required
        />
      </div>
      <div className="w-[30%] min-w-[200px]">
        <FormikField type="number" name={`${name}.drip`} label="Drip" placeholder="Drip" required />
      </div>
      <div className="w-[10%] min-w-[50px] flex items-center justify-end">
        <IconButton onClick={onRemove}>
          <RiCloseCircleLine size={30} className="text-red-500" />
        </IconButton>
      </div>
    </div>
  );
};

export default ProgramFormContentOption;
