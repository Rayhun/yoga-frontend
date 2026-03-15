'use client';
import React from 'react';
import Link from 'next/link';
import { 
  FiCreditCard, 
  FiBookOpen, 
  FiShield, 
  FiSettings,
  FiArrowRight 
} from 'react-icons/fi';

const HelpSupportPage = () => {
  const supportCategories = [
    {
      id: 'account-billing',
      title: 'Account / Billing',
      icon: FiCreditCard,
      description: 'Manage your account settings, subscription, and billing information',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: 'https://www.nourishdoc.com/knowledge'
    },
    {
      id: 'program',
      title: 'Program',
      icon: FiBookOpen,
      description: 'Get help with programs, courses, and learning resources',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: 'https://www.nourishdoc.com/knowledge'
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: FiShield,
      description: 'Learn about our privacy policy and data protection practices',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: 'https://www.nourishdoc.com/knowledge'
    },
    {
      id: 'technical',
      title: 'Technical',
      icon: FiSettings,
      description: 'Technical support, troubleshooting, and system-related issues',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: 'https://www.nourishdoc.com/knowledge'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Need help? we are here for you
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose a category below to get the support you need
          </p>
        </div>

        {/* Support Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {supportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col h-full"
              >
                {/* Icon Section */}
                <div className={`${category.bgColor} dark:bg-gray-700 p-6 sm:p-8 flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white" size={32} />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    {category.description}
                  </p>
                  
                  {/* Arrow Icon - Fixed at bottom */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-auto">
                    <span className="text-sm font-medium mr-2">Get Help</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Link>
            );
          })}
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 sm:mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Still need assistance?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our support team is available 24/7 to help you with any questions or concerns.
            </p>
            <Link
              href="/portal/ai-faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Contact Support</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;

