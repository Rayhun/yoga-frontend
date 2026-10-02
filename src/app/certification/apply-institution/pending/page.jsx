import Link from 'next/link';
import { FaRegClock } from 'react-icons/fa';

export const metadata = {
  title: 'Application Submitted — Certification',
};

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10">
        <FaRegClock className="text-green-600 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a verification code to your email. Once verified, your application will be
          submitted for review — you&apos;ll be notified as soon as a decision is made.
        </p>
        <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
          Back to Sign in
        </Link>
      </div>
    </div>
  );
};

export default Page;
