'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { MdOutlineDateRange } from 'react-icons/md';
import Button from '@/components/common/Button';
import dayjs from 'dayjs';
import Calender from '@/components/common/Calender';
import { useState } from 'react';
import FormikField from '@/components/common/form/formik/FormikField';

const text = "What's one small thing you did today that moved you close to your monthly wellness goal?";

const JournalForm = () => {
  const [open, setOpen] = useState(false);

  const initialValues = {
    journal: '',
    date: dayjs(),
  };

  const validationSchema = Yup.object({
    journal: Yup.string().required('Please write your journal entry'),
  });

  const handleSubmit = values => {
    console.log('Sleep Rating:', values);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, setFieldValue, values }) => (
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
          <FormikField name="journal" rows={4} placeholder={'Write your thoughts here...'} />
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

export default JournalForm;
