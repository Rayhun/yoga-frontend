'use client';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdDeleteOutline, MdOutlineAdd, MdOutlineRemoveRedEye } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useTable from '@/hooks/useTable';
import useConfirm from '@/hooks/useConfirm';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getCouponsList, deleteSingleCoupon } from '@/services/private/subscription/coupon';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import CouponForm from './CouponForm';

const CouponsList = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync: deleteCoupon } = useMutation({ mutationFn: deleteSingleCoupon });

  const handleEdit = useCallback(coupon => {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedCoupon(null);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    coupon => {
      confirm({
        heading: 'Delete Coupon',
        message: `Are you sure you want to delete coupon "${coupon.name}"? This will also delete it from Stripe and cannot be undone.`,
      }).then(async () => {
        try {
          await deleteCoupon({ id: coupon.id });
          await queryClient.invalidateQueries([{ queryKey: [queryKeys.coupons] }]);
          toast.success('Coupon deleted successfully');
        } catch (error) {
          toastApiError(error);
        }
      });
    },
    [confirm, deleteCoupon, queryClient]
  );

  const tableColumns = useMemo(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Code', accessorKey: 'code' },
      { header: 'Coupon Type', accessorKey: 'coupon_type' },
      { header: 'Discount Type', accessorKey: 'discount_type' },
      {
        header: 'Discount',
        cell: ({ row }) => {
          const { discount_type, discount_value, currency } = row.original;
          return discount_type === 'percent'
            ? `${discount_value}%`
            : `${currency || ''} ${discount_value}`;
        },
      },
      {
        header: 'Plan',
        cell: ({ row }) => row.original.product_detail?.title || 'All Plans',
      },
      {
        header: 'Valid Until',
        cell: ({ row }) =>
          row.original.valid_to
            ? new Date(row.original.valid_to).toLocaleDateString()
            : '—',
      },
      {
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/subscription/coupon/${row.original.id}/details`),
      },
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => handleEdit(row.original),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDelete(row.original),
      },
    ],
    [handleEdit, handleDelete, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Create Coupon',
        onClick: handleCreate,
      },
    ],
    [handleCreate]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getCouponsList,
    queryKey: [queryKeys.coupons],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Coupons">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      {!isLoading && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-medium">No coupons yet.</p>
          <p className="text-sm mt-1">Create your first coupon.</p>
        </div>
      ) : (
        <BasicTable isLoading={isLoading} columns={columns} data={data} />
      )}

      <CouponForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selected={selectedCoupon}
      />
    </div>
  );
};

export default CouponsList;
