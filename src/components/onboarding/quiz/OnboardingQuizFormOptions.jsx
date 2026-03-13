'use client';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import useLMSTagOptions from '@/hooks/useLMSTagOptions';
import useLMSProgramOptions from '@/hooks/useLMSProgramOptions';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const OnboardingQuizFormOptions = ({ form, name, push, remove, optionsData = [] }) => {
  const error = form.errors?.[name];
  const { options: tagsOptions } = useLMSTagOptions();
  const { options: programOptions } = useLMSProgramOptions();

  const selectedContentType = form.values?.screen_type;

  return (
    <div className="flex flex-col gap-3">
      {form.values?.[name]?.map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
          {/* Delete button in top right corner */}
          <div className="absolute top-2 right-2 z-10">
            <IconButton onClick={() => remove(i)} size="small">
              <RiCloseCircleLine size={20} className="text-red-500" />
            </IconButton>
          </div>
          
          <div className="flex gap-x-6 gap-y-1 overflow-auto pt-6">
            <div className="w-[45%] min-w-[200px]">
              <FormikField name={`${name}[${i}].text`} placeholder="Text" />
            </div>
            {selectedContentType === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
              <div className="w-[45%] min-w-[200px]">
                <FormikDropzone
                  name={`${name}[${i}].image`}
                  fileURLs={optionsData.length > 0 ? [optionsData[i]?.image_url] : []}
                />
              </div>
            ) : null}
          </div>
          
          {/* Tags and Program fields for each option */}
          <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row md:items-center">
            <div className="w-full md:w-1/2">
              <FormikMultiSelect
                name={`${name}[${i}].tags`}
                label="Tags"
                placeholder="Select Tags"
                options={tagsOptions || []}
              />
            </div>
            <div className="w-full md:w-1/2">
              <FormikSelect
                name={`${name}[${i}].program`}
                label="Program"
                placeholder="Select Program"
                options={programOptions || []}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => push({ text: '', image: null, tags: [], program: '' })}
      >
        Add Option
      </Button>

      {typeof error === 'string' ? <small className="text-xs text-red-500">{error}</small> : null}
    </div>
  );
};

export default OnboardingQuizFormOptions;
