'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const ResetPasswordPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to login page since this is just a placeholder
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">You will be redirected to the login page.</p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;