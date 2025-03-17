import Link from 'next/link';
import Image from 'next/image';
import { FaRegCheckCircle } from 'react-icons/fa';
import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Expert Signup',
};

const Page = () => {
  return (
    <div className="w-[calc(100vw-20px)] min-h-[calc(100vh-20px)] m-[10px] md:w-[calc(100vw-100px)] md:min-h-[calc(100vh-100px)] md:m-[50px] rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="px-26 py-17.5 text-center">
            <Link className="mb-5.5 inline-block" href="/">
              <Image src="/images/logo/logo.png" alt="Logo" width={176} height={32} />
            </Link>
            <p className="2xl:px-20">
              Sign up for free to start guiding mid-age women through life’s transitions — and turn your
              passion into profit.
            </p>
            <div className="mt-10 2xl:px-20">
              <div className="flex flex-col gap-3">
                <p className="text-left">Unlimited Earning Possibilities</p>
                {[
                  'Instant Client Access',
                  'Create on Your Terms',
                  'Built-In Marketing Power',
                  'Fast, Reliable Payouts',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-primary">
                    <FaRegCheckCircle />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {/* <span className="mb-1.5 block font-medium">Start for free</span> */}
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white">
              Inspire Wellness. Unlock Your Earning Potential
            </h2>

            <SignupForm />

            <div className="mt-6 text-center">
              <p className="text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
