'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { MdCheckCircle, MdError, MdOutlineCancel } from 'react-icons/md';

const VARIANT = {
  success: 'success',
  error: 'error',
  cancel: 'cancel',
};

const SubscriptionMessage = ({ variant = VARIANT.error, renderButton = null }) => {
  const isSuccess = variant === VARIANT.success;
  const isCancel = variant === VARIANT.cancel;

  const {
    Icon: MessageIcon,
    heading: messageHeading,
    description: messageDescription,
    regards: messageRegards,
  } = useMemo(
    () => ({
      Icon: isSuccess ? MdCheckCircle : isCancel ? MdOutlineCancel : MdError,
      heading: isSuccess ? 'Payment Successful!' : isCancel ? 'Payment Cancelled' : 'Oooppsss!!!',
      description: isSuccess
        ? 'The payment has been completed successfully. You will be notified for further steps via email. Keep checking your email'
        : isCancel
        ? 'Your payment was cancelled before completion. No charge has been made. You can return and complete checkout anytime.'
        : 'Something went wrong in payment process. Please try again later after some time',
      regards: 'Thanks for being there with us.',
    }),
    [isSuccess, isCancel]
  );

  return (
    <div className="relative bg-white p-8 rounded-lg shadow-lg text-center w-full md:w-[500px]">
      <div className="bg-white p-2 rounded-full absolute left-1/2 transform -translate-x-1/2 -top-[44px]">
        <MessageIcon size={80} className={isSuccess ? 'text-primary' : 'text-red-500'} />
      </div>

      <h1 className={`text-2xl font-bold my-4 ${isSuccess ? 'text-primary' : 'text-red-500'}`}>
        {messageHeading}
      </h1>
      <p className="text-gray-700 mb-4">{messageDescription}</p>
      <p className="text-gray-400 mb-6 italic text-sm">{messageRegards}</p>

     {renderButton || <Link href="/">
        <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/70 transition duration-300">
          Go to Home
        </button>
      </Link>}
    </div>
  );
};

export default SubscriptionMessage;
