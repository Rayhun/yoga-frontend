'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';

/**
 * Compact image picker for builder rows. Same public-upload pattern as the Program Basics thumbnail
 * (`uploadLMSFile` → `file_link`), and the same guard against its old silent failure: when the item
 * can't be saved yet (`getBlockReason()` returns a message, e.g. no title), the upload is refused
 * with that message instead of uploading a file whose save then fails out of sight.
 */
const ImageUploadField = ({ label, value, disabled = false, getBlockReason = () => null, onChange }) => {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const blockReason = getBlockReason();
    if (blockReason) {
      toast.error(blockReason);
      return;
    }
    setIsUploading(true);
    try {
      const { data } = await uploadLMSFile({ file });
      if (!data?.file_link) throw new Error('Upload did not return a file link.');
      onChange(data.file_link);
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="mb-1 block font-medium text-black dark:text-white">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-strokedark">
          {value ? (
            <Image src={value} alt={label} fill sizes="96px" className="object-cover" />
          ) : (
            <FaRegFileImage className="absolute inset-0 m-auto text-gray-300" size={22} />
          )}
        </div>
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:border-primary disabled:opacity-50 dark:border-strokedark"
        >
          {isUploading ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
        </button>
        {value && !isUploading ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('')}
            className="p-1 text-gray-500 hover:text-red-500"
            aria-label={`Remove ${label}`}
          >
            <MdClose size={18} />
          </button>
        ) : null}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
};

export default ImageUploadField;
