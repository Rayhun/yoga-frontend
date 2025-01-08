'use client';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import Button from '@/components/common/Button';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const OnboardingQuizFormOptions = ({ form, name, push, remove }) => {
  const error = form.errors?.[name];

  const selectedContentType = form.values?.screen_type;

  return (
    <div className="flex flex-col gap-3">
      {form.values?.[name]?.map((_, i) => (
        <div key={i} className="flex gap-x-6 gap-y-1 overflow-auto">
          <div className="w-[80%] md:w-[50%] min-w-[200px]">
            {selectedContentType === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
              <FormikDropzone name={`${name}[${i}].content`} />
            ) : (
              <FormikField name={`${name}[${i}].content`} placeholder="Content" />
            )}
          </div>
          <div className="w-[20%] md:w-[10%] min-w-[50px] flex items-center justify-end">
            <IconButton onClick={() => remove(i)}>
              <RiCloseCircleLine size={30} className="text-red-500" />
            </IconButton>
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => push({ content: '' })}
      >
        Add Option
      </Button>

      {typeof error === 'string' ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default OnboardingQuizFormOptions;
