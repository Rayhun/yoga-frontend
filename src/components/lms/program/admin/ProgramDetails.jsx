'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline } from 'react-icons/md';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import { BasicTable } from '@/components/common/table';
import { deleteProgramContent } from '@/services/private/lms/program';
import useConfirm from '@/hooks/useConfirm';
import queryKeys from '@/utils/query-keys';

const ProgramDetails = ({ data = {} }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { mutateAsync: deleteContent, isPending: isDeleting } = useMutation({
    mutationFn: deleteProgramContent,
    onSuccess: () => {
      toast.success('Content deleted successfully');
      // Refresh the program details
      queryClient.invalidateQueries([queryKeys.lmsPrograms, data.id]);
    },
    onError: (error) => {
      toast.error('Failed to delete content');
      console.error('Delete error:', error);
    },
  });

  const handleViewContent = (content) => {
    // Use content_id if available, otherwise use id
    const contentId = content.content_id || content.id;
    
    let targetUrl = '';
    
    if (content.content_type === 'Module') {
      targetUrl = `/portal/admin/lms/module/${contentId}/details`;
    } else if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
      // For sessions, use the content_type as the session type
      const sessionType = content.content_type.toLowerCase();
      targetUrl = `/portal/admin/lms/session/${sessionType}/${contentId}/details`;
    } else if (content.content_type === 'Quiz') {
      targetUrl = `/portal/admin/lms/quiz/${contentId}/details`;
    } else {
      toast.error(`Unknown content type: ${content.content_type}`);
      return;
    }
    
    // Try router.push first, fallback to window.location
    try {
      router.push(targetUrl);
    } catch (error) {
      console.error('Router navigation failed:', error);
      // Fallback to window.location
      window.location.href = targetUrl;
    }
  };

  const handleEditContent = (content) => {
    // Use content_id if available, otherwise use id
    const contentId = content.content_id || content.id;
    
    let targetUrl = '';
    
    if (content.content_type === 'Module') {
      targetUrl = `/portal/admin/lms/module/${contentId}/edit`;
    } else if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
      // For sessions, use the content_type as the session type
      const sessionType = content.content_type.toLowerCase();
      targetUrl = `/portal/admin/lms/session/${sessionType}/${contentId}/edit`;
    } else if (content.content_type === 'Quiz') {
      targetUrl = `/portal/admin/lms/quiz/${contentId}/edit`;
    } else {
      toast.error(`Unknown content type: ${content.content_type}`);
      return;
    }
    
    // Try router.push first, fallback to window.location
    try {
      router.push(targetUrl);
    } catch (error) {
      console.error('Router navigation failed:', error);
      // Fallback to window.location
      window.location.href = targetUrl;
    }
  };

  const handleDeleteContent = async (content) => {
    try {
      await confirm({
        message: `Are you sure you want to delete "${content.title}"? This action cannot be undone.`,
      });
      
      // Use the content's own id (not content_id) for deletion
      await deleteContent({ id: content.id });
    } catch (error) {
      // User cancelled the confirmation
      if (error?.message !== 'User cancelled') {
        console.error('Delete confirmation error:', error);
      }
    }
  };

  const tableColumns = useMemo(
    () => [
      {
        header: 'Content Title',
        accessorKey: 'title',
      },
      {
        header: 'Content Type',
        accessorKey: 'content_type',
      },
      {
        header: 'Drip',
        accessorKey: 'drip',
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3.5">
            <button 
              onClick={() => handleViewContent(row.original)} 
              className="hover:text-primary"
              title="View"
            >
              <MdOutlineRemoveRedEye size={20} />
            </button>
            <button 
              onClick={() => handleEditContent(row.original)} 
              className="hover:text-primary"
              title="Edit"
            >
              <MdOutlineEdit size={20} />
            </button>
            <button 
              onClick={() => handleDeleteContent(row.original)} 
              className="hover:text-primary"
              title="Delete"
              disabled={isDeleting}
            >
              <MdDeleteOutline size={20} />
            </button>
          </div>
        ),
      },
    ],
    [isDeleting]
  );

  return (
    <DetailsLayoutWrapper
      title="Program"
      onEdit={() => router.push(`/portal/admin/lms/program/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Benefits">
          <ol className="list-tick list-inside grid grid-cols-2 gap-2 dark:text-white">
            {data?.benefits?.map(benefit => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ol>
        </DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="File">
          <DetailsFileCard fileURL={data.image} isImage />
        </DetailsRecord>
        <DetailsRecord label="Access Setting">{data.access_setting}</DetailsRecord>
        <DetailsRecord label="Visibility Setting">{data.visibility_setting}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.categories} getChipLabel={i => i.name} />
        <MultiValueDetailsRecord label="Tags" data={data.tags} getChipLabel={i => i.name} />
        {data.linked_program && (
          <DetailsRecord label="Linked Program">{data.linked_program.title}</DetailsRecord>
        )}
        <DetailsRecord label="Content">
          <BasicTable
            columns={tableColumns}
            data={data.program}
            showHeader={false}
            showFooter={false}
          />
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ProgramDetails;