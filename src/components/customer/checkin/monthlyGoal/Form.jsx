import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import FormikField from '@/components/common/form/formik/FormikField';

const goals = [
  'Track my energy levels at 3 set times daily for 1 week',
  'Track my energy levels at 3 set times daily for 1 week',
  'Track my energy levels at 3 set times daily for 1 week',
  'Track my energy levels at 3 set times daily for 1 week',
];

const MonthlyGoalForm = () => {
  const initialValues = {
    index: '',
  };

  const validationSchema = Yup.object({
    journal: Yup.string().required('Please write your journal entry'),
  });

  const handleSubmit = values => {
    console.log('Sleep Rating:', values);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, setFieldValue, values }) => (
        <Form className="flex flex-col gap-3">
          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
            {goals.map((goal, idx) => (
              <div
                key={idx}
                onClick={() => setFieldValue('index', idx)}
                className={`cursor-pointer rounded-lg border px-4 py-3 transition
            ${values.index === idx ? 'border-primary bg-green-100/10' : 'border-gray-300 bg-white'}
          `}
              >
                <div className="inline-block mb-1 rounded-xl border border-primary bg-green-100/10 px-2 py-0.5 text-xs text-primary">
                  4 Weeks goal
                </div>
                <p className={`text-sm ${values.index === idx ? 'font-semibold' : ''}`}>{goal}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
            <Button type="button" variant="secondary" onClick={() => console.log('Cancel')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit My Thoughts'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MonthlyGoalForm;
