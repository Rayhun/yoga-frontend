import { Formik, Form } from 'formik';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import {
  INITIAL_VALUES,
  buildRejectPayload,
  getDetailsLabel,
  getDetailsMax,
  getRejectFormErrors,
  isOtherSelected,
  isRejectFormValid,
} from '@/components/certification/admin/rejectReasonModel';

// Same look as FormikField's inputs, for a native <select> (six options: a pill-and-modal picker inside this modal
// would nest dialogs for no benefit).
const SELECT_CLASS =
  'w-full rounded-xl border-2 bg-white/50 px-4 py-3 text-gray-800 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:shadow-lg focus:shadow-green-100 hover:border-gray-300 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white';

/**
 * The Disapprove form: a required "Reason" select (options come from the backend as `config`), an optional
 * "Details" textarea (required once Other is chosen) and Cancel / Disapprove — Disapprove stays disabled until the
 * form is valid. `onSubmit(payload, formikHelpers)` receives { reason_category, reason_details? }.
 */
const RejectReasonForm = ({ config, isLoading = false, loadError = false, onSubmit, onClose, initialValues = INITIAL_VALUES }) => (
  <Formik
    initialValues={initialValues}
    validate={values => getRejectFormErrors(values, config)}
    onSubmit={(values, helpers) => onSubmit(buildRejectPayload(values), helpers)}
  >
    {({ values, touched, isSubmitting, handleChange, handleBlur }) => {
      const errors = getRejectFormErrors(values, config);
      const showCategoryError = touched.reason_category && errors.reason_category && !isLoading;
      const detailsLength = (values.reason_details || '').trim().length;

      return (
        <Form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reason_category"
              className='text-sm font-semibold text-gray-700 dark:text-gray-300 after:content-["*"] after:text-red-500 after:ml-1'
            >
              Reason
            </label>
            <select
              id="reason_category"
              name="reason_category"
              value={values.reason_category}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading || !config}
              required
              aria-invalid={Boolean(showCategoryError)}
              className={`${SELECT_CLASS} ${showCategoryError ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">{isLoading ? 'Loading reasons…' : 'Select a reason'}</option>
              {(config?.categories || []).map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
            {showCategoryError ? <span className="text-sm text-red-500">{errors.reason_category}</span> : null}
            {loadError ? (
              <span role="alert" className="text-sm text-red-500">
                The list of reasons could not be loaded. Close this window and try again.
              </span>
            ) : null}
          </div>

          <FormikField
            name="reason_details"
            label={getDetailsLabel(values, config)}
            required={isOtherSelected(values, config)}
            rows={4}
          />
          <p className="-mt-2 text-right text-xs text-gray-500" aria-live="polite">
            {detailsLength}/{getDetailsMax(config)}
          </p>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !isRejectFormValid(values, config)}>
              Disapprove
            </Button>
          </div>
        </Form>
      );
    }}
  </Formik>
);

export default RejectReasonForm;
