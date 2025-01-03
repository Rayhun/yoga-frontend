/* eslint-disable @next/next/no-img-element */
'use client';
import { useCallback, useEffect } from 'react';
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
  maxSize = ONE_MB,
  accept = {
    'image/png': [],
    'image/jpg': [],
    'image/jpeg': [],
  },
  supportedFilesText = 'jpg, jpeg and png files are supported.',
  Icon = MdFileUpload,
}) {
  const [field, meta, helpers] = useField(fieldName);
  const { getRootProps, getInputProps } = useDropzone({
    accept,
    multiple,
    disabled,
    maxSize,
    onFileDialogOpen: () => {
      helpers.setTouched(true);
    },
    onDrop: files => {
      helpers.setValue(multiple ? [...field.value, ...files] : files?.[0]);
      onDrop(files);
    },
    onDropRejected: rejections => {
      const [item] = rejections;

      item.errors.forEach(err => {
        if (err.code === 'file-too-large') {
          toast.error(`File is too large! Max file size is ${(maxSize / ONE_MB).toFixed(2)}MB`);
        }
      });
    },
  });

  useEffect(() => {
    if (fileURLs.length > 0) {
      Promise.all(fileURLs.map(getFileFromURL)).then(files => {
        helpers.setValue(multiple ? files : files?.[0]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFile = useCallback(
    targetFile => {
      if (!multiple) {
        helpers.setValue(null);
        return;
      }

      const newFiles = [...field.value].filter(file => file.path !== targetFile.path);
      helpers.setValue(newFiles);
    },
    [field.value, helpers, multiple]
  );

  const selectedFiles = multiple ? [...field.value] : field.value ? [field.value] : [];
  const isErrorField = meta.touched && meta.error;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label className={`mb-1 block font-medium text-black dark:text-white ${required ? 'required' : ''}`}>
          {label}
        </label>
      ) : null}

      {selectedFiles.length ? (
        <div className="cursor-pointer border-2 border-dashed rounded-md p-5 transition w-full flex items-center justify-center bg-slate-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
          {selectedFiles.map(file => (
            <div
              key={file.name}
              className="w-[150px] h-[150px] border border-slate-300 shadow rounded flex justify-center items-center relative"
            >
              <IconButton className="absolute top-1 right-1 p-1" onClick={() => handleRemoveFile(file)}>
                <MdClose size={20} color="red" />
              </IconButton>
              {file.type.includes('image') ? (
                <img src={URL.createObjectURL(file)} className="w-full h-full" alt="img" />
              ) : (
                <div className="flex flex-col gap-2">
                  <MdAttachFile size={24} />
                  <p>{file.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          {...getRootProps()}
          role="button"
          className="cursor-pointer border-2 border-dashed rounded-md p-5 transition min-w-[250px] w-full flex items-center justify-center bg-slate-100 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          style={{ borderColor: isErrorField ? 'red' : undefined }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center rounded-md justify-center">
            <span className="text-8xl mb-3">
              <Icon size={70} className="text-slate-300" />
            </span>
            <p className="text-center m-0">Drag and drop files here, or click to select a file</p>
            <p className="text-center m-0">{supportedFilesText}</p>
          </div>
        </div>
      )}

      {isErrorField ? <small className="text-xs text-red-500">{meta.error}</small> : null}
    </div>
  );
}

export default FormikDropzone;
