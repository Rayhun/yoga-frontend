'use client';

import React, { useState } from 'react';
import { 
  FiCopy, 
  FiExternalLink, 
  FiDownload, 
  FiCheck, 
  FiLink2,
  FiCode,
  FiTrendingUp
} from 'react-icons/fi';
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FiLink2 size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl">Your Referral Links</h1>
              <p className="text-green-100 text-sm md:text-base">Share your unique referral code and links to earn commissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
          Referral Code
        </h2>
        <div className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-orange-50/50 px-6 py-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-orange-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg flex-shrink-0">
                <FiCode className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Your Unique Code</p>
                <span className="font-mono text-lg font-bold text-orange-600 dark:text-orange-400 break-all">
                  {data.referral_code || 'No referral code available'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(data.referral_code, 'Referral code', 'referral-code')}
              className={`ml-4 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                copiedItem === 'referral-code'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 hover:scale-105 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
              }`}
              title="Copy referral code"
            >
              {copiedItem === 'referral-code' ? (
                <FiCheck size={20} />
              ) : (
                <FiCopy size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Referral Links Section */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
          Custom Landing Pages
        </h2>
        <div className="space-y-4">
          {data?.referral_link && data.referral_link.length > 0 ? (
            data.referral_link.map((link, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-stroke bg-gradient-to-br from-white to-blue-50/50 px-6 py-5 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] dark:border-strokedark dark:bg-gradient-to-br dark:from-boxdark dark:to-blue-900/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
                      <FiLink2 className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Landing Page {index + 1}</p>
                      <span className="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                        {link}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(link, 'Referral link', `link-${index}`)}
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                        copiedItem === `link-${index}`
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 hover:scale-105 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
                      }`}
                      title="Copy referral link"
                    >
                      {copiedItem === `link-${index}` ? (
                        <FiCheck size={20} />
                      ) : (
                        <FiCopy size={20} />
                      )}
                    </button>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-300"
                      title="Open link in new tab"
                    >
                      <FiExternalLink size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-stroke bg-white px-6 py-12 text-center shadow-lg dark:border-strokedark dark:bg-boxdark">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FiLink2 className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No referral links available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Contact support to get your referral links</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-4">
        <a
          href="https://www.nourishdoc.com/affiliate-marketing-assets"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-medium"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FiDownload size={20} />
            </div>
            <span className="text-lg">Download Marketing Assets</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ReferralsDetails;
