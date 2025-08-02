'use client';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { useFormikContext } from 'formik';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import useUpdateEffect from '@/hooks/useUpdateEffect';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { getModuleContentOptions } from '@/services/private/lms/module';
import { MODULE_TYPE_OPTIONS } from '@/utils/options';

const ModuleFormContentOption = ({ values, name, onRemove }) => {
  const { setFieldValue } = useFormikContext();
  const [contentOptions, setContentOptions] = useState([]);

  const { mutateAsync: getContentOptions, isPending } = useMutation({
    mutationFn: getModuleContentOptions,
  });

  useUpdateEffect(() => {
    // setFieldValue(`${name}.content_id`, '');

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
      <div className="w-[40%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_type`}
          label="Type"
          placeholder="Type"
          options={MODULE_TYPE_OPTIONS}
          onChange={() => setFieldValue(`${name}.content_id`, '')}
          required
        />
      </div>
      <div className="w-[40%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_id`}
          label="Content"
          placeholder="Content"
          options={contentOptions}
          loading={isPending}
          required
        />
      </div>
      <div className="w-[20%] min-w-[50px] flex items-center justify-end">
        <IconButton onClick={onRemove}>
          <RiCloseCircleLine size={30} className="text-red-500" />
        </IconButton>
      </div>
    </div>
  );
};

export default ModuleFormContentOption;
