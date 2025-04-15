'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useDelete from '@/hooks/useDelete';
import { BasicTable } from '@/components/common/table';

import queryKeys from '@/utils/query-keys';
import { getExpertPersonalConsultation } from '@/services/private/expert/consultation';
import { FormControl, MenuItem, Select } from '@mui/material';
import { MarkCompleteConsultationButton } from './MarkCompleteButton';

const PersonalConsultationList = () => {
  const router = useRouter();
  const [status, setStatus] = useState('');

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'User',
        accessorKey: 'user_email',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
      {
        header: 'Status Action',
        accessorKey: 'status_action',
        cell: ({ row }) => {
          return row?.original?.status === 'pending' ? (
            <MarkCompleteConsultationButton id={row.original.id} />
          ) : null;
        },
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/teacher/consultation/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/teacher/consultation/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => console.log('Handle Delete'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getExpertPersonalConsultation,
    queryKey: [queryKeys.expertPersonalConsultations],
    rowActions,
  });

  const handleChange = event => {
    setStatus(event.target.value);
  };

  const filteredConsultations = useMemo(
    () =>
      status
        ? (data?.results?.data?.['all-events'] || []).filter(consult => consult.status === status)
        : data?.results?.data?.['all-events'],
    [data?.results?.data, status]
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
      <Select id="status-select" value={status} onChange={handleChange} displayEmpty>
        <MenuItem value="">Select Status</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="canceled">Canceled</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <BasicTable
      isLoading={isLoading}
      columns={columns}
      data={filteredConsultations}
      CustomFilters={CustomFilters}
    />
  );
};

export default PersonalConsultationList;
