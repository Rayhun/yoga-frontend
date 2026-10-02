'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getCommunityColor } from './communityColors';
import {
  checkExpertCircleTitle,
  executeCommunityAction,
} from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const CircleTitleSection = ({ section }) => {
  const queryClient = useQueryClient();
  const actions = section?.actions || {};
  const checkButton = actions.check_button;
  const saveButton = actions.save_button;

  const [title, setTitle] = useState(section?.current_title || '');
  const [isChecked, setIsChecked] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  useEffect(() => {
    setTitle(section?.current_title || '');
    setIsChecked(false);
    setCheckMessage('');
  }, [section?.current_title]);

  const checkMutation = useMutation({
    mutationFn: async value => {
      if (checkButton?.url) {
        return executeCommunityAction({
          url: checkButton.url,
          method: checkButton.method || 'post',
          payload: { title: value },
        });
      }
      return checkExpertCircleTitle(value);
    },
    onSuccess: response => {
      setIsChecked(true);
      setCheckMessage(response?.data?.message || 'Circle title looks good.');
      toast.success(response?.data?.message || 'Circle title looks good.');
    },
    onError: error => {
      setIsChecked(false);
      const message =
        error?.response?.data?.message || 'Please check your circle title and try again.';
      setCheckMessage(message);
      toastApiError(error);
    },
  });

  const saveMutation = useMutation({
    mutationFn: value =>
      executeCommunityAction({
        url: saveButton.url,
        method: saveButton.method || 'post',
        payload: { title: value },
      }),
    onSuccess: response => {
      const savedTitle = response?.data?.data?.title || title.trim();
      setTitle(savedTitle);
      setIsChecked(false);
      setCheckMessage('');
      toast.success(response?.data?.message || 'Circle title saved successfully.');
      queryClient.invalidateQueries({ queryKey: [queryKeys.expertCommunityDetail] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.inboxConversations] });
    },
    onError: error => {
      toastApiError(error);
    },
  });

  const handleTitleChange = event => {
    setTitle(event.target.value);
    setIsChecked(false);
    setCheckMessage('');
  };

  const handleCheck = () => {
    if (!title.trim()) {
      toast.error('Please enter a circle title first.');
      return;
    }
    checkMutation.mutate(title.trim());
  };

  const handleSave = () => {
    if (!isChecked) return;
    saveMutation.mutate(title.trim());
  };

  const canSave =
    isChecked &&
    title.trim() &&
    title.trim() !== (section?.current_title || '').trim() &&
    !saveMutation.isPending;

  const saveDisabled = !canSave || saveMutation.isPending;

  return (
    <div
      className="rounded-2xl border border-gray-100 p-6 shadow-sm md:p-8"
      style={{
        backgroundColor: getCommunityColor(section?.background_color, '#FFFFFF'),
      }}
    >
      {section?.title ? (
        <h3
          className="font-serif text-2xl font-bold md:text-3xl"
          style={{ color: getCommunityColor(section?.title_color, '#111827') }}
        >
          {section.title}
        </h3>
      ) : null}

      {section?.subtitle ? (
        <p
          className="mt-2 text-sm md:text-base"
          style={{ color: getCommunityColor(section?.subtitle_color, '#6B7280') }}
        >
          {section.subtitle}
        </p>
      ) : null}

      {section?.formula_text ? (
        <div
          className="mt-5 rounded-xl border px-4 py-4 md:px-5 md:py-5"
          style={{
            backgroundColor: getCommunityColor(section?.formula_background_color, '#E8F3ED'),
            borderColor: getCommunityColor(section?.formula_border_color, '#C8E6D4'),
          }}
        >
          <p className="text-sm leading-relaxed text-gray-800 md:text-base">
            <span className="font-semibold">Use the formula:</span>{' '}
            <em>The [Specific Goal] Circle by Coach [Name]</em>
          </p>
        </div>
      ) : null}

      {section?.example_text ? (
        <p className="mt-3 text-sm italic text-gray-500 md:text-base">{section.example_text}</p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={section?.placeholder || ''}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1E4D35] focus:ring-2 focus:ring-[#1E4D35]/10 md:text-base"
        />
        {checkButton?.label ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={checkMutation.isPending || !title.trim()}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
          >
            {checkMutation.isPending ? 'Checking…' : checkButton.label}
          </button>
        ) : null}
      </div>

      {checkMessage ? (
        <p
          className={`mt-3 text-sm ${isChecked ? 'text-[#1E4D35]' : 'text-red-600'}`}
          role="status"
        >
          {checkMessage}
        </p>
      ) : null}

      {saveButton?.label ? (
        <button
          type="button"
          onClick={handleSave}
          disabled={saveDisabled}
          className="mt-5 w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white md:text-base"
          style={{
            backgroundColor: saveDisabled
              ? undefined
              : getCommunityColor(saveButton.cta_btn_color, '#1E4D35'),
          }}
        >
          {saveMutation.isPending ? 'Saving…' : saveButton.label}
        </button>
      ) : null}
    </div>
  );
};

export default CircleTitleSection;
