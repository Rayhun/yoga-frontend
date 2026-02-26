'use client';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@mui/material';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiExport } from 'react-icons/bi';
import { useMutation } from '@tanstack/react-query';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import useConfirm from '@/hooks/useConfirm';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { deleteSingleLookupItem, getLookupItemsList, exportLookupItems } from '@/services/private/lms/lookup-item';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const CATEGORIES = {
  CERTIFICATIONS: 'Certifications',
  COACHING_AREAS: 'Coaching Areas',
};

const LookupItemsList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.CERTIFICATIONS);

  const { handleDelete: handleDeleteLookupItem } = useDelete({
    mutationFn: deleteSingleLookupItem,
    invalidateQueryKey: [queryKeys.lookupItems],
    onSuccess: () => toast.success('Lookup item deleted successfully'),
  });

  const { mutateAsync: exportLookupItemsFn, isPending: isExporting } = useMutation({
    mutationFn: exportLookupItems,
  });
  const handleExport = useCallback(async () => {
    try {
      const categoryLabel = selectedCategory === CATEGORIES.CERTIFICATIONS ? 'Certifications' : 'Coaching Areas';
      await confirm({ message: `Export ${categoryLabel} only?` });
      const response = await exportLookupItemsFn({ category: selectedCategory });
      const slug = selectedCategory === CATEGORIES.CERTIFICATIONS ? 'certifications' : 'coaching_areas';
      downloadBlobAsCsv(response, `lookup_${slug}_export.csv`);
      toast.success(`${categoryLabel} exported successfully`);
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportLookupItemsFn, selectedCategory]);

  const tableColumns = useMemo(
    () => [
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
        onClick: row => router.push(`/portal/admin/lookup/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lookup/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteLookupItem({ id: row.original.id }),
      },
    ],
    [handleDeleteLookupItem, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'export',
        Icon: BiExport,
        label: 'Export',
        isLoading: isExporting,
        onClick: handleExport,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Lookup Item',
        onClick: () => router.push('/portal/admin/lookup/add'),
      },
    ],
    [handleExport, isExporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getLookupItemsList,
    queryKey: [queryKeys.lookupItems],
    rowActions,
  });

  // Filter data by selected category
  const filteredData = useMemo(() => {
    const allData = data?.data || [];
    return allData.filter(item => item.category === selectedCategory);
  }, [data?.data, selectedCategory]);

  const handleTabChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <div>
      <PageHeader title="Lookup Items">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        <Tabs
          value={selectedCategory}
          className="mb-4"
          onChange={handleTabChange}
          classes={{ scroller: '!overflow-x-auto no-scrollbar' }}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#10b981',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10b981',
              height: 3,
            },
          }}
        >
          <Tab value={CATEGORIES.CERTIFICATIONS} label="Certifications" className="!capitalize" />
          <Tab value={CATEGORIES.COACHING_AREAS} label="Coaching Areas" className="!capitalize" />
        </Tabs>

        <div>
          <BasicTable isLoading={isLoading} columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default LookupItemsList;

