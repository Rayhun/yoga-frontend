'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '@/components/common/loader/Spinner';
import PageLoader from '@/components/common/loader/PageLoader';
import CommunityPageSection from './CommunityPageSection';
import {
  DEFAULT_COMMUNITY_COLORS,
  getCommunityColor,
} from './communityColors';
import {
  executeCommunityAction,
  getExpertCommunityData,
} from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const BUTTON_STYLE_VARIANTS = {
  dark_green_solid: 'text-white shadow-sm hover:shadow-md hover:brightness-95',
  primary_solid: 'text-white shadow-sm hover:shadow-md hover:brightness-95',
  outline_green: 'border bg-white hover:bg-green-50',
};

const getButtonClasses = (styleVariant, hasCustomColor) => {
  if (hasCustomColor) {
    return 'text-white shadow-sm hover:shadow-md hover:brightness-95';
  }
  return BUTTON_STYLE_VARIANTS[styleVariant] || BUTTON_STYLE_VARIANTS.dark_green_solid;
};

const getButtonStyle = button => {
  const backgroundColor =
    button?.cta_btn_color ||
    button?.background_color ||
    DEFAULT_COMMUNITY_COLORS.ctaButton;

  if (
    button?.style_variant === 'outline_green' &&
    !button?.cta_btn_color &&
    !button?.background_color
  ) {
    return {
      borderColor: backgroundColor,
      color: backgroundColor,
      backgroundColor: '#ffffff',
    };
  }

  return { backgroundColor };
};

const CreateCommunityCircleView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryFn: getExpertCommunityData,
    queryKey: [queryKeys.expertCommunityData],
    refetchOnMount: 'always',
  });

  const pageData = response?.data?.data;
  const header = pageData?.header;
  const sections = pageData?.sections || [];
  const footerActions = pageData?.footer_actions;
  const footerNote = footerActions?.footer_note;

  const footerButtons = useMemo(() => {
    if (Array.isArray(footerActions?.buttons) && footerActions.buttons.length) {
      return footerActions.buttons;
    }
    if (footerActions?.primary_button?.label) {
      return [footerActions.primary_button];
    }
    return [];
  }, [footerActions]);

  const actionMutation = useMutation({
    mutationFn: executeCommunityAction,
    onSuccess: res => {
      toast.success(res?.data?.message || 'Community circle created successfully');
      queryClient.invalidateQueries([queryKeys.expertCommunityData]);
      queryClient.invalidateQueries([queryKeys.expertCommunityDetail]);
      queryClient.invalidateQueries([queryKeys.inboxConversations]);
      queryClient.invalidateQueries([queryKeys.loggedInUser]);
      router.push('/portal/teacher/community');
    },
    onError: error => {
      toastApiError(error);
    },
  });

  const pageBackgroundColor = getCommunityColor(
    pageData?.background_color,
    DEFAULT_COMMUNITY_COLORS.pageBackground
  );
  const iconBackgroundColor = getCommunityColor(
    header?.icon_background_color,
    DEFAULT_COMMUNITY_COLORS.iconBackground
  );

  const sortedSections = useMemo(
    () =>
      [...sections].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
    [sections]
  );

  const handleFooterAction = button => {
    if (!button?.url) return;

    actionMutation.mutate({
      url: button.url,
      method: button.method || 'post',
      payload: button.payload,
    });
  };

  if (isLoading) return <PageLoader />;

  if (isError || !pageData) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white px-5 py-10 text-center shadow-sm md:px-8">
        <p className="text-sm text-gray-600">
          Unable to load community circle details. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl justify-center">
      <div
        className="w-full rounded-3xl px-5 py-7 shadow-sm md:px-8 md:py-9"
        style={{ backgroundColor: pageBackgroundColor }}
      >
        <div className="flex flex-col items-center text-center">
          {header?.icon || header?.image_url ? (
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-2xl"
              style={{ backgroundColor: iconBackgroundColor }}
            >
              {header?.image_url ? (
                <Image
                  src={header.image_url}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                header.icon
              )}
            </div>
          ) : null}

          {header?.title ? (
            <h2
              className="mb-3 max-w-md font-serif text-2xl font-bold leading-tight md:text-[2rem]"
              style={{
                color: getCommunityColor(header?.title_color, '#111827'),
              }}
            >
              {header.title}
            </h2>
          ) : null}

          {header?.description ? (
            <p
              className="mb-6 max-w-md text-sm leading-relaxed md:text-base"
              style={{
                color: getCommunityColor(header?.description_color, '#6B7280'),
              }}
            >
              {header.description}
            </p>
          ) : null}

          {sortedSections.length > 0 ? (
            <div className="mb-8 w-full space-y-4">
              {sortedSections.map(section => (
                <CommunityPageSection
                  key={section.section_id || section.card_type}
                  section={section}
                />
              ))}
            </div>
          ) : null}

          {footerButtons.length > 0 ? (
            <div className="mb-4 flex w-full flex-col gap-3">
              {footerButtons.map((button, index) => {
                const hasCustomColor = Boolean(
                  button?.cta_btn_color || button?.background_color
                );

                return (
                  <button
                    key={button.action_id || button.label || `footer-action-${index}`}
                    type="button"
                    onClick={() => handleFooterAction(button)}
                    disabled={actionMutation.isPending}
                    style={getButtonStyle(button)}
                    className={`flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 md:text-base ${getButtonClasses(button.style_variant, hasCustomColor)}`}
                  >
                    {actionMutation.isPending ? (
                      <Spinner size={18} color="#ffffff" />
                    ) : (
                      button.label
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}

          {footerNote?.text ? (
            <p
              className="max-w-md text-xs leading-relaxed md:text-sm"
              style={{
                color: getCommunityColor(footerNote?.text_color, '#9CA3AF'),
              }}
            >
              {footerNote.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityCircleView;
