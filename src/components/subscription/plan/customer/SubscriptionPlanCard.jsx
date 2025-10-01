'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const SubscriptionPlanCard = ({ data: planDetails = {}, currencySymbol = '$', isFeatured = false }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
 
  const refferalCode = searchParams.get('ref');

  console.log("refferalCode dajalkj",refferalCode)

  let checkoutLink = planDetails.id ? `${pathname}/${planDetails.id}/checkout` : '#'

  if(refferalCode && planDetails.id){
    checkoutLink = `${checkoutLink}?ref=${refferalCode}`
  }


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
        <Link href={checkoutLink}>
          <button className={`w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 ${
            isFeatured 
              ? 'bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600' 
              : 'bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600'
          }`}>
            Subscribe Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
