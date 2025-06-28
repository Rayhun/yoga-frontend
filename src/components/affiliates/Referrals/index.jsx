'use client';

import React from 'react';
import { FiCopy, FiExternalLink, FiShare2, FiDownload } from 'react-icons/fi';
import { DetailsLayoutWrapper } from '@/components/common/details';
import { toast } from 'react-toastify';

const ReferralsDetails = ({ data = {} }) => {
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  return (
    <DetailsLayoutWrapper title="Your Referral Links">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Referral Code</h3>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
            <span className="font-mono text-orange-500">{data.referral_code}</span>
            <button
              onClick={() => handleCopy(data.referral_code, 'Referral code')}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiCopy size={20} />
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Custom Landing Page</h3>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
            <span className="truncate text-gray-800">{data.referral_link}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(data.referral_link, 'Referral link')}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiCopy size={20} />
              </button>
              <a
                href={data.referral_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <FiExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => handleCopy(data.referral_link, 'Referral link')}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
          >
            <FiShare2 size={18} />
            <span>Share Links</span>
          </button>
          <button
            onClick={() => {
              /* download logic here */
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FiDownload size={18} />
            <span>Download Assets</span>
          </button>
        </div>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ReferralsDetails;
