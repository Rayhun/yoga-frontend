'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { MdOutlineRemoveRedEye, MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikField from '@/components/common/form/formik/FormikField';
import SortableRowControls from '@/components/common/form/SortableRowControls';
import { getProgramContentOptions } from '@/services/private/lms/program';
import { PROGRAM_TYPE_OPTIONS } from '@/utils/options';

// Global cache to prevent duplicate API calls across multiple components
const contentOptionsCache = new Map();
const loadingStates = new Map();

const ProgramFormContentOption = ({
  values,
  name,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}) => {
  const router = useRouter();
  const [contentOptions, setContentOptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setFieldValue } = useFormikContext();
  const hasLoadedOptionsRef = useRef(false);

  const { mutateAsync: getContentOptions, isPending } = useMutation({
    mutationFn: getProgramContentOptions,
  });

  const loadContentOptions = async (selectedType) => {
    if (!selectedType) return;
    
    // Check if data is already cached
    if (contentOptionsCache.has(selectedType)) {
      setContentOptions(contentOptionsCache.get(selectedType));
      hasLoadedOptionsRef.current = true;
      return;
    }
    
    // Check if already loading for this type
    if (loadingStates.get(selectedType)) {
      // Wait for the ongoing request
      const checkLoading = setInterval(() => {
        if (!loadingStates.get(selectedType) && contentOptionsCache.has(selectedType)) {
          setContentOptions(contentOptionsCache.get(selectedType));
          hasLoadedOptionsRef.current = true;
          clearInterval(checkLoading);
        }
      }, 100);
      return;
    }
    
    loadingStates.set(selectedType, true);
    
    try {
      const contentOptionsResponse = await getContentOptions({ type: selectedType });
      const modifiedOptionsData = contentOptionsResponse?.data?.map(i => ({
        label: i.title,
        value: i.id,
      }));
      
      // Cache the result
      contentOptionsCache.set(selectedType, modifiedOptionsData);
      setContentOptions(modifiedOptionsData);
      hasLoadedOptionsRef.current = true;
    } catch (error) {
      console.error('Error fetching content options:', error);
      setContentOptions([]);
    } finally {
      loadingStates.set(selectedType, false);
    }
  };

  const handleTypeChange = async (selectedType) => {
    // Clear the content_id when type changes (only if not initializing)
    if (isInitialized) {
      setFieldValue(`${name}.content_id`, '');
    }
    
    // Clear content options
    setContentOptions([]);
    hasLoadedOptionsRef.current = false;
    
    // Load new content options
    await loadContentOptions(selectedType);
  };

  const handleViewContent = (content) => {
    if (!content.content_id) return;
    
    let targetUrl = '';
    
    if (content.content_type === 'Module') {
      targetUrl = `/portal/admin/lms/module/${content.content_id}/details`;
    } else if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
      const sessionType = content.content_type.toLowerCase();
      targetUrl = `/portal/admin/lms/session/${sessionType}/${content.content_id}/details`;
    } else if (content.content_type === 'Quiz') {
      targetUrl = `/portal/admin/lms/quiz/${content.content_id}/details`;
    } else {
      return;
    }
    
    try {
      router.push(targetUrl);
    } catch (error) {
      console.error('Router navigation failed:', error);
      window.location.href = targetUrl;
    }
  };

  const handleEditContent = (content) => {
    if (!content.content_id) return;
    
    let targetUrl = '';
    
    if (content.content_type === 'Module') {
      targetUrl = `/portal/admin/lms/module/${content.content_id}/edit`;
    } else if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
      const sessionType = content.content_type.toLowerCase();
      targetUrl = `/portal/admin/lms/session/${sessionType}/${content.content_id}/edit`;
    } else if (content.content_type === 'Quiz') {
      targetUrl = `/portal/admin/lms/quiz/${content.content_id}/edit`;
    } else {
      return;
    }
    
    try {
      router.push(targetUrl);
    } catch (error) {
      console.error('Router navigation failed:', error);
      window.location.href = targetUrl;
    }
  };

  // Initialize component on mount and handle content type changes
  useEffect(() => {
    const handleContentType = async () => {
      if (values.content_type && !hasLoadedOptionsRef.current) {
        await loadContentOptions(values.content_type);
      }
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    handleContentType();
  }, [values.content_type]);

  return (
    <div
      className={`flex items-start gap-x-4 gap-y-1 overflow-auto rounded-lg border border-stroke p-3 dark:border-strokedark ${
        isDragOver ? 'ring-2 ring-primary' : ''
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <SortableRowControls
        index={index}
        total={total}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        isDragging={isDragging}
        isDragOver={isDragOver}
      />
      <div className="flex min-w-0 flex-1 items-start gap-x-6 gap-y-1 overflow-auto">
        <div className="w-36 shrink-0">
          <FormikSelect
            name={`${name}.content_type`}
            label="Type"
            placeholder="Type"
            options={PROGRAM_TYPE_OPTIONS}
            onChange={(value) => handleTypeChange(value)}
            required
          />
        </div>
        <div className="min-w-0 flex-1 basis-[35%]">
          <FormikSelect
            name={`${name}.content_id`}
            label="Content"
            placeholder="Content"
            options={contentOptions}
            loading={isPending}
            required
          />
        </div>
        <div className="w-[15%] min-w-[120px] shrink-0">
          <FormikField 
            type="number" 
            name={`${name}.drip`} 
            label="Drip" 
            placeholder="Drip" 
            min={0} 
            required 
          />
        </div>
        <div className="flex w-[30%] min-w-[180px] shrink-0 items-center justify-center gap-2 self-center">
          {values.content_id && (
            <>
              <button 
                type="button"
                onClick={() => handleViewContent(values)} 
                className="hover:text-primary p-1"
                title="View"
              >
                <MdOutlineRemoveRedEye size={20} />
              </button>
              <button 
                type="button"
                onClick={() => handleEditContent(values)} 
                className="hover:text-primary p-1"
                title="Edit"
              >
                <MdOutlineEdit size={20} />
              </button>
            </>
          )}
          <button 
            type="button"
            onClick={onRemove} 
            className="hover:text-primary p-1"
            title="Delete"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramFormContentOption;
