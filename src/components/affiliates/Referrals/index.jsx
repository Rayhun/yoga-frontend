'use client';

import React, { useState } from 'react';
import { FiCopy, FiExternalLink, FiShare2, FiDownload, FiCheck } from 'react-icons/fi';
import { DetailsLayoutWrapper } from '@/components/common/details';
import { toast } from 'react-toastify';

const ReferralsDetails = ({ data = {} }) => {
  const [copiedItem, setCopiedItem] = useState(null);
  

  
  const handleCopy = async (text, label, itemId) => {
    if (!text || text.trim() === '') {
      toast.error('No content to copy', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
        toast.success(`${label} copied to clipboard`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopiedItem(itemId);
          setTimeout(() => setCopiedItem(null), 2000);
          toast.success(`${label} copied to clipboard`, {
            position: 'top-right',
            autoClose: 3000,
          });
        } catch (err) {
          toast.error('Failed to copy to clipboard', {
            position: 'top-right',
            autoClose: 3000,
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy to clipboard', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <DetailsLayoutWrapper title="Your Referral Links">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Referral Code</h3>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
            <span className="font-mono text-orange-500">
              {data.referral_code || 'No referral code available'}
            </span>
            <button
              onClick={() => handleCopy(data.referral_code, 'Referral code', 'referral-code')}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              title="Copy referral code"
            >
              {copiedItem === 'referral-code' ? (
                <FiCheck size={20} className="text-green-500" />
              ) : (
                <FiCopy size={20} />
              )}
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Custom Landing Page</h3>
          <div className="space-y-4">
            {data?.referral_link && data.referral_link.length > 0 ? (
              data.referral_link.map((link, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                  <span className="truncate text-gray-800">{link}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(link, 'Referral link', `link-${index}`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                      title="Copy referral link"
                    >
                      {copiedItem === `link-${index}` ? (
                        <FiCheck size={20} className="text-green-500" />
                      ) : (
                        <FiCopy size={20} />
                      )}
                    </button>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiExternalLink size={20} />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No referral links available
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-4 pt-4">
          {/* <button
            onClick={() => handleCopy(data.referral_link, 'Referral link')}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
          >
            <FiShare2 size={18} />
            <span>Share Links</span>
          </button> */}

          <a
            href="https://www.nourishdoc.com/affiliate-marketing-assets"
            target="_blank"
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
          >
            <FiDownload size={18} />
            <span>Download Assets</span>
          </a>
        </div>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ReferralsDetails;
