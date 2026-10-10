'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageLoader from '@/components/common/loader/PageLoader';
import CertificateViewer from '@/components/certification/certificate/CertificateViewer';
import { verifyCertificate } from '@/services/public/certificate';
import queryKeys from '@/utils/query-keys';

/** Public landing page for the QR target: `<site>/verify/<code>`. No auth — anyone holding
 *  the link has to be able to confirm the claim. */
const STATUS_COPY = {
  valid: {
    title: 'Certificate verified',
    tone: 'border-green-200 bg-green-50 text-green-800',
    Icon: FiCheckCircle,
  },
  expired: {
    title: 'Certificate expired',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
    Icon: FiXCircle,
  },
  revoked: {
    title: 'Certificate revoked',
    tone: 'border-red-200 bg-red-50 text-red-800',
    Icon: FiXCircle,
  },
};

const VerdictBanner = ({ status, isValid }) => {
  const copy = STATUS_COPY[status] || {
    title: isValid ? 'Certificate verified' : 'Certificate not valid',
    tone: isValid ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800',
    Icon: isValid ? FiCheckCircle : FiXCircle,
  };
  const { title, tone, Icon } = copy;

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${tone}`}>
      <Icon size={22} aria-hidden="true" />
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
};

const CertificateVerifyPage = () => {
  const params = useParams();
  const code = params?.code;

  const { data, isLoading, isError, error } = useQuery({
    queryFn: () => verifyCertificate({ code }),
    queryKey: [queryKeys.certificationVerify, code],
    enabled: !!code,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  const result = data?.data?.data;
  const notFound = isError && error?.response?.status === 404;

  if (notFound || !result) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-md">
        <h2 className="mb-2 text-xl font-bold text-gray-800">Certificate not found</h2>
        <p className="mb-6 text-sm text-gray-600">
          We could not find a certificate with the code <span className="font-semibold">{code}</span>. Please
          double-check the code printed on the certificate.
        </p>
        <Link href="/" className="inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white">
          Go to NourishDoc
        </Link>
      </div>
    );
  }

  const certificate = result.certificate;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificate verification</h1>
            <p className="mt-1 text-sm text-gray-600">
              Issued by {result.issuer} · code <span className="font-semibold">{result.code}</span>
            </p>
          </div>
          <VerdictBanner status={result.status} isValid={result.is_valid} />
        </div>

        <dl className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Recipient</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{result.recipient}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Course or program</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{result.course}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Issued on</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{result.issuedDate || '—'}</dd>
          </div>
        </dl>

        {certificate ? <CertificateViewer data={certificate} /> : null}
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
