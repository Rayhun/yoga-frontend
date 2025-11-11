'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import useGeoLocation from '@/hooks/useGeoLocation';
import { toast } from 'react-toastify';

const SubscriptionPlanCard = ({ data: planDetails = {}, currencySymbol = '$', isFeatured = false }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { countryCode, isLoading } = useGeoLocation();
  const [showCountryMessage, setShowCountryMessage] = useState(false);
 
  const refferalCode = searchParams.get('ref');

  console.log("refferalCode dajalkj",refferalCode)

  // Allowed countries
  const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

  // Determine the correct link based on subscription type
  let checkoutLink = '#';
  
  if (planDetails.id) {
    if (planDetails.subscription_type === 'Business') {
      // For business plans, redirect to business subscription form
      checkoutLink = `${pathname}/${planDetails.id}/business-subscription`;
    } else {
      // For individual plans, use the regular checkout
      checkoutLink = `${pathname}/${planDetails.id}/checkout`;
    }
    
    // Add referral code if present
    if (refferalCode) {
      checkoutLink = `${checkoutLink}?ref=${refferalCode}`;
    }
  }

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    
    // If still loading country, wait
    if (isLoading) {
      toast.info('Detecting your location...');
      return;
    }

    // Check if country is allowed
    if (!countryCode || !ALLOWED_COUNTRIES.includes(countryCode)) {
      setShowCountryMessage(true);
      toast.error('We currently only support purchases from the United States, Canada, and India.');
      return;
    }

    // Country is allowed, proceed to checkout
    router.push(checkoutLink);
  };


  return (
    <div
      key={planDetails.id}
      className={`relative bg-white py-6 px-4 rounded-2xl text-center border border-gray-200/50 
        ${isFeatured 
          ? 'ring-2 ring-primary/20 shadow-2xl shadow-primary/10' 
          : 'shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20'
        } 
        transition-all duration-300 ease-out hover:transform hover:-translate-y-2 hover:scale-[1.02]
        backdrop-blur-sm bg-white/95 h-full flex flex-col`}
    >
      {/* Plan Title */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{planDetails.title}</h3>
        {isFeatured && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Most Popular
          </div>
        )}
      </div>
      {/* Price Section */}
      <div className={`relative p-6 rounded-xl mb-6 ${
        isFeatured 
          ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border border-gray-200/50'
      }`}>
        {planDetails.discounted_price && planDetails.discounted_price !== planDetails.price ? (
          // Show discount pricing (original price strikethrough + discounted price)
          <div className="text-center">
            <div className="text-base opacity-75 line-through mb-2">
              {currencySymbol}{Math.round(planDetails.price)}
            </div>
            <div className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-lg">{currencySymbol}</span>
              {Math.round(planDetails.discounted_price)}
              <span className="text-lg font-normal">/{planDetails.subscription_tenure_period}</span>
            </div>
          </div>
        ) : (
          // Show regular pricing
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-lg">{currencySymbol}</span>
              {Math.round(planDetails.price)}
              <span className="text-lg font-normal">/{planDetails.subscription_tenure_period}</span>
            </div>
          </div>
        )}
      </div>
      {/* Features List */}
      <div className="px-2 mb-6 flex-1">
        <ul className="space-y-3">
          {planDetails.features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm text-gray-600">
              <div className="flex-shrink-0 w-5 h-5 mr-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* CTA Button */}
      <div className="px-4 pb-2 mt-auto">
        <button 
          onClick={handleCheckoutClick}
          disabled={isLoading}
          className={`w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isFeatured 
              ? 'bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600' 
              : 'bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600'
          }`}>
          {isLoading ? 'Loading...' : 'Subscribe Now'}
        </button>
        {showCountryMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 text-center">
              We currently only support purchases from the United States, Canada, and India.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
