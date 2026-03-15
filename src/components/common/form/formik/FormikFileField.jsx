
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useField } from 'formik';
import { MdClose, MdFileUpload, MdInsertDriveFile } from 'react-icons/md';

const FormikFileField = ({
  name,
  label,
  fileURL = '',
  maxSize = 10 * 1024 * 1024, 
  accept = ['.pdf', '.doc', '.docx', '.txt'],
  disabled = false,
  required = false,
}) => {
  const [field, meta, helpers] = useField(name);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (field.value instanceof File) {
      setFileName(field.value.name);
      setFileSize((field.value.size / 1024).toFixed(2) + ' KB');
    } else if (typeof field.value === 'string' && field.value) {
      setFileName(field.value.split('/').pop());
      setFileSize('');
    } else if (fileURL) {
      setFileName(fileURL.split('/').pop());
      setFileSize('');
    } else {
      setFileName('');
      setFileSize('');
    }
  }, [field.value, fileURL]);

  const onFileChange = useCallback(
    e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > maxSize) {
        alert(`File too large (max ${(maxSize / 1024 / 1024).toFixed(1)} MB)`);
        return;
      }
      helpers.setValue(file);
    },
    [helpers, maxSize]
  );

  const onDrop = useCallback(
    e => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (file.size > maxSize) {
        alert(`File too large (max ${(maxSize / 1024 / 1024).toFixed(1)} MB)`);
        return;
      }
      helpers.setValue(file);
    },
    [helpers, disabled, maxSize]
  );

  const [dragging, setDragging] = useState(false);
  const onDragOver = e => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const isError = meta.touched && !!meta.error;

  const handleRemove = () => {
    helpers.setValue(null);
    setFileName('');
    setFileSize('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
          ${
            isError ? 'border-red-500 bg-red-50' : dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          disabled={disabled}
          onChange={onFileChange}
          className="hidden"
        />

        {fileName ? (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdInsertDriveFile className="text-blue-600" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <MdClose className="text-red-500" size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <MdFileUpload className="text-gray-400 mb-2" size={40} />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.join(', ')} (max {(maxSize / 1024 / 1024).toFixed(1)} MB)
            </p>
          </div>
        )}
      </div>

      {isError && <p className="text-xs text-red-500">{meta.error}</p>}
    </div>
  );
};

export default FormikFileField;
