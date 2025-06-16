import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
// import dayjs from 'dayjs';
// import FormikField from '@/components/common/form/formik/FormikField';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { createGoalTracker, getGoalList } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import { useMutation, useQuery } from '@tanstack/react-query';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const MonthlyGoalForm = ({ selectedConcern }) => {
  // const queryClient = useQueryClient();

  const { isFetching, data: goalTrackers } = useQuery({
    queryFn: () => getGoalList({ concern: selectedConcern }),
    queryKey: [queryKeys.goalList, selectedConcern],
  });

  const { mutateAsync: createTracker } = useMutation({
    mutationFn: createGoalTracker,
  });
  

  const initialValues = {
    goal: '',
  };

  const validationSchema = Yup.object({
    goal: Yup.string().required('Please select a goal from list'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createTracker({ payload: { ...values } });
      toast.success('Tracker for specified gaol created successfully.');

      // resetForm(); Stoped from reseting the form

    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (goalTrackers?.data?.data?.length === 0 && !isFetching)
    return <div className="flex justify-center items-center h-full">No Goal Tracker Found</div>;

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, setFieldValue, values, errors, resetForm }) => (
        <LoadingWrapper isLoading={isFetching}>
          <Form className="flex flex-col gap-3">
            <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              {goalTrackers?.data?.data?.map((goal, idx) => (
                <div
                  key={`${goal.id}-${idx}`}
                  onClick={() => setFieldValue('goal', goal.id)}
                  className={`cursor-pointer rounded-lg border px-4 py-3 transition
            ${values.goal === goal.id ? 'border-primary bg-green-100/10' : 'border-gray-300 bg-white'}
          `}
                >
                  <div className="inline-block mb-1 rounded-xl border border-primary bg-green-100/10 px-2 py-0.5 text-xs text-primary">
                    4 Weeks goal
                  </div>
                  <p className={`text-sm ${values.goal === goal.id ? 'font-semibold' : ''}`}>{goal?.title}</p>
                </div>
              ))}
            </div>
            {errors?.goal ? <small className="text-xs text-red-500">{errors.goal}</small> : null}
            <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit My Goals'}
              </Button>
            </div>
          </Form>
        </LoadingWrapper>
      )}
    </Formik>
  );
};

export default MonthlyGoalForm;
