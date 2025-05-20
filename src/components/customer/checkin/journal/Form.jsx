'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { MdOutlineDateRange } from 'react-icons/md';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import Calender from '@/components/common/Calender';
import { useState } from 'react';
import FormikField from '@/components/common/form/formik/FormikField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNewJournal } from '@/services/private/customer/journal';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { toast } from 'react-toastify';

const text = "What's one small thing you did today that moved you close to your monthly wellness goal?";

const JournalForm = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: creatJournal } = useMutation({
    mutationFn: createNewJournal,
  });

  const initialValues = {
    description: '',
    date: dayjs(),
  };

  const validationSchema = Yup.object({
    description: Yup.string().required('Please write your journal entry'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await creatJournal({ payload: { ...values, date: dayjs(values.date).format('YYYY-MM-DD') } });
      toast.success('Journal to specified date created successfully.');

      resetForm();

      await queryClient.invalidateQueries([
        {
          queryKey: [queryKeys.journalList],
        },
      ]);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, setFieldValue, resetForm, values }) => (
        <Form className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-md font-medium text-primary flex items-center gap-1">
              {dayjs(values.date).format('dddd MMMM D')}
              {dayjs(values.date).isSame(dayjs(), 'day') ? ' (Today)' : ''}
            </p>
            <p
              className="text-md font-medium text-primary flex items-center gap-1 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <MdOutlineDateRange size={18} /> Change Date
            </p>
            <Calender
              value={values.date}
              onChange={date => {
                setFieldValue('date', date);
                handleClose();
              }}
              isPopover={true}
              open={open}
              handleClose={handleClose}
            />
          </div>
          <h4 className="text-xl mt-6">Daily reflection</h4>
          <div className="mt-4">
            <div className="border-l-4 border-orange-400 bg-orange-50 italic px-4 py-4 rounded-md">
              {text}
            </div>
          </div>
          <FormikField name="description" rows={4} placeholder={'Write your thoughts here...'} />
          <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
            <Button type="button" variant="secondary" onClick={resetForm}>
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

export default JournalForm;
