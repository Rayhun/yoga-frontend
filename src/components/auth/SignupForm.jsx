'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import FormikField from '@/components/common/form/FormikField';
import Button from '@/components/common/Button';
import { registerNewUser } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const SignupForm = () => {
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationFn: registerNewUser,
  });

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().min(3, 'Must contain at least 3 characters').required('Required!'),
    last_name: Yup.string(),
    email: Yup.string().email('Invalid Email').required('Required!'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required!'),
    confirm_password: Yup.string()
      .required('Required!')
      .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { email, password, confirm_password, ...rest } = values;

      const payload = {
        email,
        password,
        profile: {
          ...rest,
        },
      };

      await mutateAsync({ payload });

      toast.success('Account created successfully');

      router.push('/auth/login');
      setSubmitting(false);
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <FormikField name="first_name" label="First Name" placeholder="First Name" Icon={FiUser} required />
          <FormikField name="last_name" label="Last Name" placeholder="Last Name" Icon={FiUser} />
          <FormikField type="email" name="email" label="Email" placeholder="Email" Icon={FiMail} required />
          <FormikField
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            Icon={FiLock}
            required
          />
          <FormikField
            type="password"
            name="confirm_password"
            label="Confirm Password"
            placeholder="Confirm Password"
            Icon={FiLock}
            required
          />
          <Button type="submit" className="mt-3" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating Account' : 'Sign Up'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default SignupForm;
