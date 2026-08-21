'use client';
import React, { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import '@/css/quill-custom.css';
import { useField } from 'formik';
import { stripHtmlLinks } from '@/utils/stripHtmlLinks';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const DEFAULT_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['clean'],
];

const DEFAULT_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'link', 'align',
];

const FormikRichTextEditor = ({ 
  name, 
  label, 
  placeholder = '', 
  required = false, 
  rows = 4,
  className = '',
  disableLinks = false,
  ...props 
}) => {
  const [field, meta, helpers] = useField(name);

  const modules = useMemo(() => {
    const toolbar = [...DEFAULT_TOOLBAR];
    if (!disableLinks) {
      toolbar.splice(4, 0, ['link']);
    }
    return { toolbar };
  }, [disableLinks]);

  const formats = useMemo(
    () => (disableLinks ? DEFAULT_FORMATS.filter(format => format !== 'link') : DEFAULT_FORMATS),
    [disableLinks]
  );

  useEffect(() => {
    if (!disableLinks || !field.value) return;
    const stripped = stripHtmlLinks(field.value);
    if (stripped !== field.value) {
      helpers.setValue(stripped);
    }
  }, [disableLinks, field.value, helpers]);

  const handleChange = (content) => {
    helpers.setValue(disableLinks ? stripHtmlLinks(content) : content);
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
      
      <div className="border border-gray-300 rounded-lg overflow-auto quill-resizable-wrapper" style={{ resize: 'both', minHeight: `${rows * 1.5}rem`, maxWidth: '100%' }}>
        <ReactQuill
          theme="snow"
          value={field.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            minHeight: `${rows * 1.5}rem`,
            height: '100%'
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
