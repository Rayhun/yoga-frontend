import Link from 'next/link';
import Image from 'next/image';
import InstitutionApplyForm from '@/components/certification/apply/InstitutionApplyForm';

export const metadata = {
  title: 'Apply as Institution — Certification',
};

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-8 lg:p-12">
        <div className="text-center mb-8">
          <Link className="mb-6 inline-block" href="/">
            <Image src="/images/logo/logo.png" alt="Logo" width={180} height={36} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Apply as Institution</h1>
          <p className="text-gray-600">
            Bring your organization onto NourishDoc and issue certifications at scale.
          </p>
        </div>

        <InstitutionApplyForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
