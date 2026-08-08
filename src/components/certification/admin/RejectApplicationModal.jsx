import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Modal } from '@mui/material';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';

const validationSchema = Yup.object({
  rejected_reason: Yup.string().trim().required('A reason is required'),
});

const RejectApplicationModal = ({ show, onClose, onSubmit }) => {
  return (
    <Modal open={show} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
          <h2 className="text-center text-2xl font-semibold mb-6">Reject Application</h2>

          <Formik
            initialValues={{ rejected_reason: '' }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <FormikField name="rejected_reason" label="Reason" rows={4} required />

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Reject
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  );
};

export default RejectApplicationModal;
