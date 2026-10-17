'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import CertificateViewer from '@/components/certification/certificate/CertificateViewer';
import { getProgramCertificate } from '@/services/private/certification/certificate';
import queryKeys from '@/utils/query-keys';

/** Turn the API's error message into something we can show when the certificate
 *  isn't there yet (403 = still working through the program, 404 = not enrolled). */
const explainError = (error, programId) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 403) return message || 'Complete every required lesson to earn your certificate.';
  if (status === 404) return message || "You don't have a certificate for this program yet.";
  return message || 'We could not load your certificate. Please try again.';
};

const CertificatePage = () => {
  const params = useParams();
  const programId = params?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryFn: () => getProgramCertificate({ id: programId }),
    queryKey: [queryKeys.certificationCertificate, programId],
    enabled: !!programId,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  const certificate = data?.data?.data;

  if (isError || !certificate) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-md dark:bg-boxdark">
        <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Certificate unavailable</h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">{explainError(error, programId)}</p>
        <Link
          href={`/portal/customer/certification/${programId}`}
          className="inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary/80"
        >
          Back to program
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your certificate</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {certificate.course} · issued {certificate.issuedDate}
          </p>
        </div>
        <Link
          href={`/portal/customer/certification/${programId}`}
          className="ml-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-boxdark-2"
        >
          Back to program
        </Link>
      </div>

      <CertificateViewer data={certificate} />
    </div>
  );
};

export default CertificatePage;
