'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useUserOptions from '@/hooks/useUserOptions';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { addNewGroup, updateExistingGroup } from '@/services/private/chat/group';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { GROUP_VISIBILITY_OPTIONS } from '@/utils/options';

const GroupForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { options: userOptions } = useUserOptions();

  const { mutateAsync: addGroup } = useMutation({
    mutationFn: addNewGroup,
  });
  const { mutateAsync: updateGroup } = useMutation({
    mutationFn: updateExistingGroup,
  });

  const initialValues = {
    group_name: selected?.group_name || '',
    members: selected?.members.map(i => i.id) || [],
    visibility: selected?.visibility || '',
  };

  const validationSchema = Yup.object({
    group_name: Yup.string().required('Required!'),
    members: Yup.array().min(1, 'Must add at least one member'),
    visibility: Yup.string().required('Required!'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateGroup({ payload: { id: selected.id, ...values } });
        toast.success('Group updated successfully');
      } else {
        await addGroup({ payload: { ...values } });
        toast.success('Group added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.chatGroups, selected.id] : [queryKeys.chatGroups] },
      ]);
      router.push('/portal/admin/chat/group');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Group Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="group_name" label="Name" placeholder="Name" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="visibility"
                  label="Visibility"
                  placeholder="Select Visibility"
                  options={GROUP_VISIBILITY_OPTIONS}
                  required
                />
              </div>
            </div>
            <div className="w-full xl:w-1/2">
              <FormikMultiSelect
                name="members"
                label="Members"
                placeholder="Members"
                options={userOptions}
                required
              />
            </div>
            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default GroupForm;
