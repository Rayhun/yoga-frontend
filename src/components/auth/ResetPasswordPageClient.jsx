'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { validatePasswordResetToken } from '@/services/public/auth';
import { toastApiError } from '@/utils/helpers';

const ResetPasswordPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [error, setError] = useState(null);

  const { mutateAsync: validateToken } = useMutation({
    mutationFn: validatePasswordResetToken,
  });

  useEffect(() => {
    const validateResetToken = async () => {
      const uidb64 = searchParams.get('uidb64');
      const token = searchParams.get('token');

      if (!uidb64 || !token) {
        setError('Invalid reset link. Please request a new password reset link.');
        setIsValidating(false);
        return;
      }

      try {
        await validateToken({ payload: { uidb64, token } });
        setIsTokenValid(true);
      } catch (error) {
        setError(
          error?.response?.data?.message || 
          'Invalid or expired reset link. Please request a new password reset link.'
        );
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateResetToken();
  }, [searchParams, validateToken]);

  if (isValidating) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Validating Reset Link...</h2>
          <p className="text-gray-600">Please wait while we verify your reset link</p>
        </div>
      </div>
    );
  }

  if (error || !isTokenValid) {
    return (
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link className="inline-block" href="/">
            <Image src="/images/logo/logo.png" alt="Logo" width={160} height={32} />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The password reset link is invalid or has expired.'}
          </p>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
            <p className="text-sm text-red-800">
              💡 Please request a new password reset link from the login page.
            </p>
          </div>

          <Link
            href="/auth/forgot-password"
            className="inline-block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            Request New Reset Link
          </Link>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden mb-8 text-center">
        <Link className="inline-block" href="/">
          <Image src="/images/logo/logo.png" alt="Logo" width={160} height={32} />
        </Link>
      </div>

      <div className="text-center mb-8 animate-slideInRight">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="animate-fadeIn">
        <ResetPasswordForm />
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
  );
};

export default ResetPasswordPageClient;

