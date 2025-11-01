import Link from 'next/link';
import Image from 'next/image';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password',
};

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-600 rounded-full"></div>
              <div className="absolute top-32 right-16 w-16 h-16 border-2 border-emerald-600 rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-12 h-12 border-2 border-teal-600 rounded-full"></div>
              <div className="absolute bottom-32 right-10 w-24 h-24 border-2 border-green-600 rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 py-16">
              <Link className="mb-8 inline-block transform hover:scale-105 transition-transform duration-300" href="/">
                <Image 
                  src="/images/logo/logo.png" 
                  alt="Logo" 
                  width={200} 
                  height={40}
                />
              </Link>

              <div className="space-y-6 animate-slideInLeft">
                <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                  Reset Your
                  <span className="block text-orange-600 animate-float">Password</span>
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                  Keep your account secure. Enter your email address and we'll send you a link to reset your password
                </p>

                <div className="flex items-center justify-center space-x-4 mt-8">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8 text-center">
                <Link className="inline-block" href="/">
                  <Image src="/images/logo/logo.png" alt="Logo" width={160} height={32} />
                </Link>
              </div>

              <div className="text-center mb-8 animate-slideInRight">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600">
                  Enter your email address to receive a password reset link
                </p>
              </div>

              <div className="animate-fadeIn">
                <ForgotPasswordForm />
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                    Return to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
