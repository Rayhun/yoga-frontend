'use client';
import { useQuery } from '@tanstack/react-query';
import { FaBuilding, FaCheckCircle, FaRegClock, FaTimesCircle, FaSearch } from 'react-icons/fa';
import queryKeys from '@/utils/query-keys';
import { getMyInstitutionApplication } from '@/services/private/certification/application';
import PageLoader from '@/components/common/loader/PageLoader';

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', Icon: FaRegClock },
  { key: 'under_review', label: 'Under Review', Icon: FaSearch },
  { key: 'approved', label: 'Approved', Icon: FaCheckCircle },
];

const STEP_ORDER = ['submitted', 'under_review', 'approved'];

const ApplicationStatusContent = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.myInstitutionApplication],
    queryFn: getMyInstitutionApplication,
    select: res => res?.data,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  const status = data?.application_status || 'submitted';
  const isRejected = status === 'rejected';
  const currentStep = isRejected ? -1 : STEP_ORDER.indexOf(status);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <FaBuilding className="text-green-600 text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Application</h1>
          <p className="text-sm text-gray-500">Institution certification application status</p>
        </div>
      </div>

      {/* Progress steps */}
      {!isRejected && (
        <div className="flex items-center mb-8">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                      ${isCompleted ? 'bg-green-600 border-green-600 text-white'
                        : isActive ? 'bg-white border-green-600 text-green-600'
                        : 'bg-white border-gray-300 text-gray-400'}`}
                  >
                    <step.Icon className="text-lg" />
                  </div>
                  <span className={`text-xs mt-1 font-medium ${isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status card */}
      {isRejected ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="text-red-600 text-2xl mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 text-lg">Application Not Approved</h3>
              <p className="text-sm text-gray-700 mt-1">
                Unfortunately, your application was not approved at this time.
              </p>
              {data?.rejected_reason && (
                <div className="mt-3 bg-white border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800">
                    <strong>Reason: </strong>{data.rejected_reason}
                  </p>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-600">
                Please contact support or await further guidance on re-submitting your application.
              </p>
            </div>
          </div>
        </div>
      ) : status === 'approved' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-600 text-2xl mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-700 text-lg">Application Approved! 🎉</h3>
              <p className="text-sm text-gray-700 mt-1">
                Congratulations! Your institution is verified. You can now create and manage certification programs.
              </p>
              <Link
                href="/portal/institution/programs"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                View Certification Programs →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <FaRegClock className="text-amber-600 text-2xl mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-700 text-lg">Application Under Review</h3>
              <p className="text-sm text-gray-700 mt-1">
                We've received your application and it's being reviewed by our team.
                You'll be notified via email when a decision is made.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application details summary */}
      {data && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">
            Application Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Institution Name</dt>
              <dd className="font-medium text-gray-800 dark:text-white">{data.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Legal Name</dt>
              <dd className="font-medium text-gray-800 dark:text-white">{data.legal_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Country</dt>
              <dd className="font-medium text-gray-800 dark:text-white">{data.country || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Business Email</dt>
              <dd className="font-medium text-gray-800 dark:text-white">{data.business_email || '—'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusContent;
