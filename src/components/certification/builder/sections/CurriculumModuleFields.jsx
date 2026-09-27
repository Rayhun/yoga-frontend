import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import ImageUploadField from '@/components/certification/builder/ImageUploadField';
import { UNLOCK_RULE_OPTIONS } from './curriculumFields';

// Module-level settings under the module title: description, image, and when it unlocks.
const CurriculumModuleFields = ({ mi, module, disabled, onModuleChange, getBlockReason }) => (
  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
    <div className="md:col-span-2">
      <FormikField
        name={`modules[${mi}].description`}
        label="Module Description"
        placeholder="What this module covers"
        rows={2}
        disabled={disabled}
      />
    </div>
    <FormikSelect
      name={`modules[${mi}].unlock_rule`}
      label="Unlocks"
      options={UNLOCK_RULE_OPTIONS}
      disabled={disabled}
      onChange={value => onModuleChange({ unlock_rule: value || module.unlock_rule })}
    />
    {module.unlock_rule === 'date' ? (
      <FormikField name={`modules[${mi}].unlock_date`} label="Unlock Date" type="date" disabled={disabled} />
    ) : (
      <div className="hidden md:block" />
    )}
    <ImageUploadField
      label="Module Image"
      value={module.image}
      disabled={disabled}
      getBlockReason={getBlockReason}
      onChange={image => onModuleChange({ image })}
    />
  </div>
);

export default CurriculumModuleFields;
