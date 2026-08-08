'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiTrendingUp, FiAward } from 'react-icons/fi';
import { updateUser } from '@/services/private/user';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const LEARNER_TYPE_OPTIONS = [
  {
    value: 'career',
    title: "I'm building a career",
    description: 'Get job-ready skills and credentials to start or grow your career.',
    Icon: FiTrendingUp,
  },
  {
    value: 'professional',
    title: "I'm a licensed professional",
    description: 'Earn continuing education credits to maintain your credentials.',
    Icon: FiAward,
  },
];

const LearnerTypeStep = () => {
  const queryClient = useQueryClient();
  const [selectedValue, setSelectedValue] = useState(null);
  const { mutateAsync, isPending } = useMutation({ mutationFn: updateUser });

  const handleSelect = async value => {
    if (isPending) return;
    setSelectedValue(value);
    try {
      await mutateAsync({ learner_type: value });
      await queryClient.invalidateQueries([queryKeys.loggedInUser]);
    } catch (error) {
      setSelectedValue(null);
      toastApiError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          What brings you here?
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This helps us tailor your dashboard and recommendations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEARNER_TYPE_OPTIONS.map(({ value, title, description, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={isPending}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-gray-800 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed ${
                selectedValue === value
                  ? 'border-green-600 shadow-lg scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnerTypeStep;
