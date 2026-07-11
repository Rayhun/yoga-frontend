import Image from 'next/image';
import { LuBriefcaseBusiness } from 'react-icons/lu';

const BusinessProfileCard = ({ businessName, businessLogo }) => {
  if (!businessName && !businessLogo) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/50 shadow-sm dark:border-emerald-900/30 dark:from-emerald-950/25 dark:via-gray-800/80 dark:to-green-950/15">
      <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
        {businessLogo ? (
          <div className="relative flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md ring-2 ring-emerald-200/70 dark:bg-gray-900 dark:ring-emerald-800/50">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={businessLogo}
                  alt={`${businessName || 'Business'} logo`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 shadow-inner dark:from-emerald-900/40 dark:to-green-900/30">
            <LuBriefcaseBusiness className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          {businessName ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Business name
              </p>
              <h6 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{businessName}</h6>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Business logo</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileCard;
