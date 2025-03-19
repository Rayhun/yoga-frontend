'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SubscriptionPlanCard = ({ data: planDetails = {}, currencySymbol = '$', isFeatured = false }) => {
  const pathname = usePathname();

  return (
    <div
      key={planDetails.id}
      className="bg-white py-5 rounded-lg text-center border-[1px] border-gray-400 hover:border-t-[4px] hover:border-t-black-2 shadow-[0_1rem_3rem_rgba(31,45,61,0.125)] hover:transform -translate-y-1.5"
    >
      <p className="my-3 text-lg font-semibold text-black">{planDetails.title}</p>
      {/* Price */}
      <div className={`p-3 ${isFeatured ? 'bg-[#8BC24A] text-white' : 'text-gray-600'}`}>
        <div className="text-xl">
          <span className="text-2xl md:text-4xl font-bold">
            <span className="text-lg">{currencySymbol}</span>
            {planDetails.discounted_price}
            <span className="text-lg">/{planDetails.subscription_tenure_period}</span>
          </span>
        </div>
      </div>
      <ul className="px-3 mt-4 space-y-2">
        {planDetails.features.map((feature, i) => (
          <li key={i} className="text-sm">
            {feature}
          </li>
        ))}
      </ul>
      <div className="p-3">
        <Link href={`${pathname}/${planDetails.id}/checkout`}>
          <button className="mt-6 px-6 py-2 text-sm font-medium text-white bg-primary transition-all rounded-full border-solid border-2 border-transparent hover:border-black hover:text-black hover:bg-white">
            Subscribe
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
