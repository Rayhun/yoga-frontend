/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useField } from 'formik';
import { MdClose, MdFileUpload } from 'react-icons/md';

const FormikImageInput = ({
  name,
  label,
  fileURL = '',
  maxSize = 10 * 1024 * 1024,
  accept = ['image/*'],
  disabled = false,
  required = false,
  size = 160,               // ← control your circle diameter here
  shape = 'circle',         // 'circle' | 'square'
}) => {
  const [field, meta, helpers] = useField(name);
  const [preview, setPreview] = useState(fileURL);
  const inputRef = useRef(null);

  // keep preview in sync
  useEffect(() => {
    if (field.value instanceof File) {
      setPreview(URL.createObjectURL(field.value));
    } else if (typeof field.value === 'string') {
      setPreview(field.value);
    } else {
      setPreview(fileURL);
    }
  }, [field.value, fileURL]);

  const onFileChange = useCallback(
    e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > maxSize) {
        alert(`File too big (max ${(maxSize/1024/1024).toFixed(1)} MB).`);
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
        alert(`File too big (max ${(maxSize/1024/1024).toFixed(1)} MB).`);
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
  const isCircle = shape === 'circle';
  const dimClass = `w-[${size}px] h-[${size}px]`;
  const radiusClass = isCircle ? 'rounded-full' : 'rounded-xl';

  const handleRemove = () => {
    helpers.setValue(null);
    setPreview('');
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Outer circle */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative ${dimClass} ${radiusClass} overflow-hidden select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isError ? 'border-red-500' : dragging ? 'border-blue-400' : 'border-gray-300 hover:border-gray-400'}
          border-2
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

        {preview ? (
          <img
            src={preview}
            alt="preview"
            className={`w-full h-full ${radiusClass} ${isCircle ? 'object-cover' : 'object-contain bg-white'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <MdFileUpload size={48} />
            <p className="text-sm">Click or drop image</p>
          </div>
        )}

        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition">
            <MdFileUpload className="absolute bottom-2 right-2 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      <div className='flex justify-center items-center mt-2'>
        {preview && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <MdClose className="text-lg" />
            Remove
          </button>
        )}
      </div>

      {isError && <small className="text-xs text-red-500">{meta.error}</small>}
    </div>
  );
};

export default FormikImageInput;
