'use client';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';

const LMSQuizFormOptions = ({ form, name, push, remove }) => {
  const error = form.errors?.[name];

  return (
    <div className="flex flex-col gap-3">
      {form.values?.[name]?.map((_, i) => (
        <div key={i} className="flex flex-col gap-x-6 gap-y-1 md:flex-row md:items-center">
          <div className="md:w-1/2">
            <FormikField name={`${name}[${i}].text`} label="Text" placeholder="Text" required />
          </div>
          <div className="md:w-1/2">
            <div className="flex justify-between items-center">
              <FormikCheckbox name={`${name}[${i}].is_correct`} label="Is Correct?" />
              <IconButton onClick={() => remove(i)}>
                <RiCloseCircleLine size={30} className="text-red-500" />
              </IconButton>
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => push({ text: '', is_correct: false })}
      >
        Add Option
      </Button>

      {typeof error === 'string' ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default LMSQuizFormOptions;
