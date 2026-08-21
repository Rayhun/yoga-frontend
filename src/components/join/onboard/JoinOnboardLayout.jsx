'use client';

import { FiChevronLeft } from 'react-icons/fi';
import JoinCircleBrandingPanel from '@/components/join/JoinCircleBrandingPanel';
import JoinOnboardProgressBar from './JoinOnboardProgressBar';

const JoinOnboardLayout = ({
  activeStep = 1,
  canGoBack = false,
  showProgress = true,
  onBack,
  inviteData,
  children,
}) => (
  <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 lg:h-screen lg:min-h-0 lg:overflow-hidden">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-green-200 opacity-20 mix-blend-multiply blur-xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-emerald-200 opacity-20 mix-blend-multiply blur-xl delay-1000" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-teal-200 opacity-20 mix-blend-multiply blur-xl delay-500" />
    </div>

    <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl">
      <div className="flex min-h-[600px] flex-col lg:max-h-[calc(100vh-2rem)] lg:flex-row">
        <div className="w-full lg:flex lg:w-1/2 lg:flex-col">
          <JoinCircleBrandingPanel
            header={inviteData?.header}
            metricsRow={inviteData?.metrics_row}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col justify-center px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10 lg:pb-12">
            <div className="mx-auto flex w-full max-w-[300px] flex-1 flex-col sm:max-w-[320px] lg:mx-0 lg:max-w-md">
              {canGoBack || showProgress ? (
                <div className="mb-6 sm:mb-8">
                  {canGoBack ? (
                    <button
                      type="button"
                      onClick={onBack}
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      aria-label="Go back"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                  ) : null}
                  {showProgress ? <JoinOnboardProgressBar activeStep={activeStep} /> : null}
                </div>
              ) : null}

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default JoinOnboardLayout;
