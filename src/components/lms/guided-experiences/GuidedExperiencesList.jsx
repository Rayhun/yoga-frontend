'use client';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@mui/material';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline } from 'react-icons/md';
import { GoPlus } from 'react-icons/go';
import useDelete from '@/hooks/useDelete';
import useConfirm from '@/hooks/useConfirm';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getGuidedExperiencesList, deleteGuidedExperience, toggleGuidedExperienceStatus } from '@/services/private/lms/guided-experiences';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const EVENT_TYPES = {
  WORKSHOP: 'workshop',
  BOOTCAMP: 'bootcamp',
  LIVE_EVENT: 'live event',
  MASTERCLASS: 'masterclass',
};

const GuidedExperiencesList = ({ eventType: propEventType }) => {
  const router = useRouter();
  const [selectedEventType, setSelectedEventType] = useState(propEventType || EVENT_TYPES.WORKSHOP);
  const eventType = propEventType || selectedEventType;
  const [filters, setFilters] = useState({ event_type: eventType });
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { handleDelete: handleDeleteExperience } = useDelete({
    mutationFn: deleteGuidedExperience,
    invalidateQueryKey: [queryKeys.guidedExperiences, eventType],
    onSuccess: () => toast.success('Guided experience deleted successfully'),
  });

  const { mutateAsync: toggleStatus } = useMutation({
    mutationFn: toggleGuidedExperienceStatus,
  });

  const handleToggleStatus = useCallback(
    async selected => {
      const message = selected?.is_active
        ? 'Are you sure you want to deactivate this guided experience?'
        : 'Are you sure you want to activate this guided experience?';
      await confirm({
        message,
      })
        .then(async () => {
          await toggleStatus({ id: selected?.id });
          toast.success('Guided experience status updated successfully');

          await queryClient.invalidateQueries([queryKeys.guidedExperiences, eventType, JSON.stringify(filters)]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, toggleStatus, queryClient, filters, eventType]
  );

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Host',
        accessorKey: 'host',
        cell: ({ row }) => {
          const event = row?.original;
          // If guest_name exists, show guest name, otherwise show created_by (expert)
          if (event?.guest_name) {
            return event.guest_name;
          }
          const createdBy = event?.created_by;
          if (createdBy) {
            const firstName = createdBy.first_name || '';
            const lastName = createdBy.last_name || '';
            const name = `${firstName} ${lastName}`.trim();
            return name || createdBy.email || 'N/A';
          }
          return 'N/A';
        },
      },
      {
        header: 'Start Date',
        accessorKey: 'start_date',
        cell: ({ row }) => {
          const date = row?.original?.start_date;
          return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => {
          const price = row?.original?.price;
          return price ? `$${price}` : 'Free';
        },
      },
      {
        header: 'Active Status',
        accessorKey: 'is_active',
        cell: ({ row }) => row?.original?.is_active ? 'Active' : 'Inactive',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => {
          const itemEventType = row.original.event_type || eventType;
          const eventTypePath = itemEventType === 'live event' ? 'live-event' : itemEventType;
          router.push(`/portal/admin/lms/expert/guided-experiences/${eventTypePath}/${row.original.id}/edit`);
        },
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => {
          const itemEventType = row.original.event_type || eventType;
          const eventTypePath = itemEventType === 'live event' ? 'live-event' : itemEventType;
          router.push(`/portal/admin/lms/expert/guided-experiences/${eventTypePath}/${row.original.id}/details`);
        },
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteExperience({ id: row.original.id }),
      },
      {
        id: 'active',
        Icon: BsToggleOff,
        render: row => !row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
      {
        id: 'deactive',
        Icon: BsToggleOn,
        render: row => row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
    ],
    [handleDeleteExperience, router, handleToggleStatus, eventType]
  );

  const { isLoading, columns, data: tableData } = useTable({
    columns: tableColumns,
    queryFn: async () => {
      // Fetch guided experiences with event_type filter
      const response = await getGuidedExperiencesList(filters);
      // Transform the response to match useTable's expected format
      return {
        data: response?.data?.data || [],
      };
    },
    queryKey: [queryKeys.guidedExperiences, eventType, JSON.stringify(filters)],
    rowActions,
  });

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        variant: 'primary',
        onClick: () => {
          const currentEventType = propEventType || selectedEventType;
          const eventTypePath = currentEventType === 'live event' ? 'live-event' : currentEventType;
          router.push(`/portal/admin/lms/expert/guided-experiences/${eventTypePath}/add`);
        },
        label: 'Add New',
        Icon: GoPlus,
      },
    ],
    [router, propEventType, selectedEventType]
  );

  const handleTabChange = (event, newValue) => {
    setSelectedEventType(newValue);
    setFilters({ event_type: newValue });
  };

  const getEventTypePath = (type) => {
    return type === 'live event' ? 'live-event' : type;
  };

  // Update filters when eventType changes
  useEffect(() => {
    if (!propEventType) {
      setFilters({ event_type: selectedEventType });
    }
  }, [selectedEventType, propEventType]);

  return (
    <div>
      <PageHeader title="Guided Experiences">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        {!propEventType && (
          <Tabs
            value={selectedEventType}
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
            <Tab value={EVENT_TYPES.WORKSHOP} label="Workshops" className="!capitalize" />
            <Tab value={EVENT_TYPES.BOOTCAMP} label="Bootcamps" className="!capitalize" />
            <Tab value={EVENT_TYPES.LIVE_EVENT} label="Live Events" className="!capitalize" />
            <Tab value={EVENT_TYPES.MASTERCLASS} label="Masterclasses" className="!capitalize" />
          </Tabs>
        )}

        <div>
          <BasicTable isLoading={isLoading} columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
};

export default GuidedExperiencesList;

