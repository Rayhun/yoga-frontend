'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import { MdOutlineRemoveRedEye, MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikField from '@/components/common/form/formik/FormikField';
import { getModuleContentOptions } from '@/services/private/lms/module';
import { MODULE_TYPE_OPTIONS } from '@/utils/options';

// Global cache to prevent duplicate API calls across multiple components
const moduleContentOptionsCache = new Map();
const moduleLoadingStates = new Map();

const getOrderByValue = item => Number(item?.order_by ?? item?.order);

const ModuleFormContentOption = ({ values, name, onRemove, allValues, setFieldError }) => {
  const router = useRouter();
  const { setFieldValue } = useFormikContext();
  const [contentOptions, setContentOptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedOptionsRef = useRef(false);

  const { mutateAsync: getContentOptions, isPending } = useMutation({
    mutationFn: getModuleContentOptions,
  });

  const loadContentOptions = async (selectedType) => {
    if (!selectedType) return;
    
    // Check if data is already cached
    if (moduleContentOptionsCache.has(selectedType)) {
      setContentOptions(moduleContentOptionsCache.get(selectedType));
      hasLoadedOptionsRef.current = true;
      return;
    }
    
    // Check if already loading for this type
    if (moduleLoadingStates.get(selectedType)) {
      // Wait for the ongoing request
      const checkLoading = setInterval(() => {
        if (!moduleLoadingStates.get(selectedType) && moduleContentOptionsCache.has(selectedType)) {
          setContentOptions(moduleContentOptionsCache.get(selectedType));
          hasLoadedOptionsRef.current = true;
          clearInterval(checkLoading);
        }
      }, 100);
      return;
    }
    
    moduleLoadingStates.set(selectedType, true);
    
    try {
      const contentOptionsResponse = await getContentOptions({ type: selectedType });
      const modifiedOptionsData = contentOptionsResponse?.data?.map(i => ({
        label: i.title,
        value: i.id,
      }));
      
      // Cache the result
      moduleContentOptionsCache.set(selectedType, modifiedOptionsData);
      setContentOptions(modifiedOptionsData);
      hasLoadedOptionsRef.current = true;
    } catch (error) {
      console.error('Error fetching content options:', error);
      setContentOptions([]);
    } finally {
      moduleLoadingStates.set(selectedType, false);
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
    
    if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
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
    
    if (content.content_type === 'Image' || content.content_type === 'Video' || content.content_type === 'Audio') {
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

  const handleOrderChange = (orderValue) => {
    // Set the field value first
    setFieldValue(`${name}.order_by`, orderValue);
    
    // Clear any existing errors first
    setFieldError(`${name}.order_by`, '');
    
    // Check if order is empty
    if (!orderValue || orderValue === '') {
      setFieldError(`${name}.order_by`, 'Order is required');
      return;
    }
    
    // Check if order is a valid positive number
    const orderNum = parseInt(orderValue);
    if (isNaN(orderNum) || orderNum < 1) {
      setFieldError(`${name}.order_by`, 'Order must be a positive number');
      return;
    }
    
    // Check if order is already used by another row
    const currentIndex = parseInt(name.match(/\d+/)[0]);
    const isDuplicateOrder = allValues.module_content.some((item, index) => 
      index !== currentIndex && getOrderByValue(item) === orderNum
    );
    
    if (isDuplicateOrder) {
      setFieldError(`${name}.order_by`, 'Order number must be unique');
    }
  };

  // Validate order field on blur
  const handleOrderBlur = () => {
    const orderValue = values.order_by;
    
    // Check if order is empty
    if (!orderValue || orderValue === '') {
      setFieldError(`${name}.order_by`, 'Order is required');
      return;
    }
    
    // Check if order is a valid positive number
    const orderNum = parseInt(orderValue);
    if (isNaN(orderNum) || orderNum < 1) {
      setFieldError(`${name}.order_by`, 'Order must be a positive number');
      return;
    }
    
    // Check if order is already used by another row
    const currentIndex = parseInt(name.match(/\d+/)[0]);
    const isDuplicateOrder = allValues.module_content.some((item, index) => 
      index !== currentIndex && getOrderByValue(item) === orderNum
    );
    
    if (isDuplicateOrder) {
      setFieldError(`${name}.order_by`, 'Order number must be unique');
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
    <div className="flex items-start gap-x-6 gap-y-1 overflow-auto">
      <div className="w-36 shrink-0">
        <FormikSelect
          name={`${name}.content_type`}
          label="Type"
          placeholder="Type"
          options={MODULE_TYPE_OPTIONS}
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
      <div className="w-[20%] min-w-[120px] shrink-0">
        <FormikField 
          type="number" 
          name={`${name}.order_by`} 
          label="Order" 
          placeholder="Order" 
          min={1} 
          required
          onChange={(e) => handleOrderChange(e.target.value)}
          onBlur={handleOrderBlur}
        />
      </div>
      <div className="flex w-[20%] min-w-[150px] shrink-0 items-center justify-center gap-2 self-center">
        {values.content_id && (
          <>
            <button 
              onClick={() => handleViewContent(values)} 
              className="hover:text-primary p-1"
              title="View"
            >
              <MdOutlineRemoveRedEye size={20} />
            </button>
            <button 
              onClick={() => handleEditContent(values)} 
              className="hover:text-primary p-1"
              title="Edit"
            >
              <MdOutlineEdit size={20} />
            </button>
          </>
        )}
        <button 
          onClick={onRemove} 
          className="hover:text-primary p-1"
          title="Delete"
        >
          <MdDeleteOutline size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModuleFormContentOption;
