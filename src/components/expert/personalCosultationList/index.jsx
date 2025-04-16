'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useTable from '@/hooks/useTable';
import { BasicTable } from '@/components/common/table';

import queryKeys from '@/utils/query-keys';
import { getExpertPersonalConsultation } from '@/services/private/expert/consultation';
import { FormControl, MenuItem, Select } from '@mui/material';
import { Actions } from './Actions';

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
        header: 'Action',
        accessorKey: 'status_action',
        enableSorting: false,
        cell: ({ row }) => {
          return row?.original?.status === 'pending' ? (
            <Actions id={row.original.id} />
          ) : null;
        },
      },
    ],
    []
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getExpertPersonalConsultation,
    queryKey: [queryKeys.expertPersonalConsultations],
    rowActions: [],
    removeActionColumn: true
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
