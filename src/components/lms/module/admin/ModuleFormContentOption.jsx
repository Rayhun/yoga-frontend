'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormikContext } from 'formik';
import IconButton from '@mui/material/IconButton';
import { RiCloseCircleLine } from 'react-icons/ri';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { getModuleContentOptions } from '@/services/private/lms/module';
import { MODULE_TYPE_OPTIONS } from '@/utils/options';

// Global cache to prevent duplicate API calls across multiple components
const moduleContentOptionsCache = new Map();
const moduleLoadingStates = new Map();

const ModuleFormContentOption = ({ values, name, onRemove }) => {
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
    <div className="flex gap-x-6 gap-y-1 items-center overflow-auto">
      <div className="w-[40%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_type`}
          label="Type"
          placeholder="Type"
          options={MODULE_TYPE_OPTIONS}
          onChange={(value) => handleTypeChange(value)}
          required
        />
      </div>
      <div className="w-[40%] min-w-[200px]">
        <FormikSelect
          name={`${name}.content_id`}
          label="Content"
          placeholder="Content"
          options={contentOptions}
          loading={isPending}

          required
        />
      </div>
      <div className="w-[20%] min-w-[50px] flex items-center justify-end">
        <IconButton onClick={onRemove}>
          <RiCloseCircleLine size={30} className="text-red-500" />
        </IconButton>
      </div>
    </div>
  );
};

export default ModuleFormContentOption;
