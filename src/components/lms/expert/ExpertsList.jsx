'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getExpertsList, deleteSingleExpert, importExperts } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';
import { FormControl, MenuItem, Select } from '@mui/material';

const ExpertsList = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('');
  const { isImporting, handleImport: handleImportExperts } = useImport({
    mutationFn: importExperts,
    invalidateQueryKey: [queryKeys.lmsExperts],
    onSuccess: () => toast.success('Experts imported successfully'),
  });
  const { handleDelete: handleDeleteExpert } = useDelete({
    mutationFn: deleteSingleExpert,
    invalidateQueryKey: [queryKeys.lmsExperts],
    onSuccess: () => toast.success('Expert deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'first_name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Title',
        accessorKey: 'title',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/expert/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/expert/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteExpert({ id: row.original.id }),
      },
    ],
    [handleDeleteExpert, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportExperts,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Expert',
        onClick: () => router.push('/portal/admin/lms/expert/add'),
      },
    ],
    [handleImportExperts, isImporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getExpertsList,
    queryKey: [queryKeys.lmsExperts],
    rowActions,
  });

  const handleChange = event => {
    setUserType(event.target.value);
  };

  const filteredExperts = useMemo(
    () =>
      userType
        ? (data || []).filter(user => {
            if (userType === 'registered') {
              return user.is_user === true;
            } else if (userType === 'imported') {
              return user.is_user === false;
            }
            return false;
          })
        : data,
    [data, userType]
  );

  const CustomFilters = (
    <FormControl
      fullWidth
      variant="outlined"
      sx={{
        maxWidth: 200,
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: '#ffffff',

          height: '46px',
        },
      }}
    >
      <Select id="status-select" value={userType} onChange={handleChange} displayEmpty>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="registered">Registered User</MenuItem>
        <MenuItem value="imported">Imported User</MenuItem>
      </Select>
    </FormControl>
  );

  console.log('data', data);
  return (
    <div>
      <PageHeader title="Experts">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={filteredExperts} CustomFilters={CustomFilters} />
    </div>
  );
};

export default ExpertsList;
