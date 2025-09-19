'use client';
import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/css/quill-custom.css';
import { useField } from 'formik';

const FormikRichTextEditor = ({ 
  name, 
  label, 
  placeholder = '', 
  required = false, 
  rows = 4,
  className = '',
  ...props 
}) => {
  const [field, meta, helpers] = useField(name);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'align'
  ];

  const handleChange = (content) => {
    helpers.setValue(content);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactQuill
          theme="snow"
          value={field.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            height: `${rows * 1.5}rem`,
            minHeight: `${rows * 1.5}rem`
          }}
          {...props}
        />
      </div>
      
      {meta.touched && meta.error && (
        <p className="text-sm text-red-600">{meta.error}</p>
      )}
    </div>
  );
};

export default FormikRichTextEditor;
