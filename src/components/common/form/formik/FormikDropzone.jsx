/* eslint-disable @next/next/no-img-element */
'use client';
import { useCallback, useEffect, useState } from 'react';
import { useField } from 'formik';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import { MdFileUpload, MdClose, MdAttachFile } from 'react-icons/md';
import { getFileFromURL } from '@/utils/helpers';
import { ONE_MB } from '@/utils/general';

function FormikDropzone({
  name: fieldName,
  label,
  fileURLs = [],
  onDrop = () => {},
  multiple = false,
  disabled = false,
  required = false,
  maxSize = 10 * ONE_MB,
  accept = {
    'image/png': [],
    'image/jpg': [],
    'image/jpeg': [],
  },
  supportedFilesText = 'jpg, jpeg and png files are supported.',
  Icon = MdFileUpload,
}) {
  const [field, meta, helpers] = useField(fieldName);
  const [files, setFiles] = useState([]);

  const handleFileChange = useCallback(
    newFiles => {
      if (multiple) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);

        helpers.setValue(updatedFiles);
      } else {
        const singleFile = newFiles[0];
        setFiles([singleFile]);
        helpers.setValue(singleFile);
      }

      onDrop(newFiles);
    },
    [files, helpers, multiple, onDrop]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    multiple,
    disabled,
    maxSize,
    onFileDialogOpen: () => {
      helpers.setTouched(true);
    },
    onDrop: handleFileChange,
    onDropRejected: rejections => {
      const [item] = rejections;

      item.errors.forEach(err => {
        if (err.code === 'file-too-large') {
          toast.error(`File is too large! Max file size is ${(maxSize / ONE_MB).toFixed(2)}MB`);
        }
      });
    },
  });

  // Initialize files from fileURLs on component mount
  useEffect(() => {
    if (fileURLs.length > 0) {
      Promise.all(fileURLs.map(getFileFromURL)).then(initialFiles => {
        setFiles(multiple ? initialFiles : [initialFiles[0]]);
        helpers.setValue(multiple ? initialFiles : initialFiles[0]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync field value to internal state when it changes externally
  useEffect(() => {
    if (field.value) {
      const fileArray = Array.isArray(field.value) ? field.value : [field.value];
      setFiles(fileArray);
    } else {
      setFiles([]);
    }
  }, [field.value]);

  const handleRemoveFile = useCallback(
    targetFile => {
      const newFiles = files.filter(file => file.path !== targetFile.path);
      setFiles(newFiles);

      if (multiple) {
        helpers.setValue(newFiles);
      } else {
        helpers.setValue(null);
      }
    },
    [files, helpers, multiple]
  );

  const isErrorField = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}

      {!multiple && files?.length ? (
        // Single file mode - show only the selected file
        <div className="cursor-pointer border-2 border-dashed rounded-md p-5 transition min-h-[200px] w-full flex items-center justify-center bg-slate-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
          {files?.map((file, index) => (
            <div
              key={`${file?.name || file?.path}-${index}`}
              className="w-[150px] h-[150px] border border-slate-300 shadow rounded flex justify-center items-center relative"
            >
              <IconButton className="absolute top-1 right-1 p-1" onClick={() => handleRemoveFile(file)}>
                <MdClose size={20} color="red" />
              </IconButton>
              {file?.type?.includes('image') ? (
                <img src={URL.createObjectURL(file)} className="w-full h-full" alt="img" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <MdAttachFile size={24} />
                  <p>{file?.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Multiple files mode or empty single file mode
        <div className="flex flex-col gap-3">
          {/* Dropzone always visible in multiple mode or when no files in single mode */}
          <div
            {...getRootProps()}
            role="button"
            className="cursor-pointer border-2 border-dashed rounded-md p-5 transition min-h-[200px] w-full flex items-center justify-center bg-slate-100 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            style={{ borderColor: isErrorField ? 'red' : undefined }}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center rounded-md justify-center">
              <span className="text-8xl mb-3">
                <Icon size={70} className="text-slate-300" />
              </span>
              <p className="text-center m-0">
                {multiple
                  ? 'Drag and drop files here, or click to select files'
                  : 'Drag and drop a file here, or click to select a file'}
              </p>
              <p className="text-center m-0">{supportedFilesText}</p>
            </div>
          </div>

          {/* Show files below dropzone when in multiple mode */}
          {multiple && files?.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3">
              <p className="w-full text-sm text-slate-500 mb-2">Selected files ({files.length}):</p>
              {files?.map((file, index) => (
                <div
                  key={`${file.name || file.path}-${index}`}
                  className="w-full border border-slate-300 shadow rounded flex justify-between items-center relative p-2"
                >
                  {file?.type?.includes('image') ? (
                    <img src={URL.createObjectURL(file)} className="w-15 h-15 object-cover" alt="img" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-center">
                      <p className="text-lg truncate max-w-full">{file?.name}</p>
                    </div>
                  )}
                   <IconButton
                    className="p-1 bg-white bg-opacity-70"
                    onClick={() => handleRemoveFile(file)}
                  >
                    <MdClose size={20} color="red" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
}

export default FormikDropzone;
