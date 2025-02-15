'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SubscriptionPlanCard = ({ data: planDetails = {} }) => {
  const pathname = usePathname();

  return (
    <div
      key={planDetails.id}
      className="p-6 bg-white rounded-lg text-center hover:border-t-[4px] hover:border-t-black-2 hover:shadow-[0_1rem_3rem_rgba(31,45,61,0.125)] hover:transform -translate-y-1.5"
    >
      <div className="flex justify-center mb-4">
        <span className="text-5xl text-purple-600">🏡</span>
      </div>
      {/* Price */}
      {planDetails.discounted_price ? (
        <div className="text-gray-500 text-xl">
          <span className="text-2xl md:text-4xl font-bold text-black">${planDetails.discounted_price}</span>
          <span className="line-through ml-2 text-lg">${planDetails.price}</span>
        </div>
      ) : (
        <p className="text-2xl md:text-4xl font-bold text-black">${planDetails.price}</p>
      )}
      <p className="text-lg font-semibold text-gray-700 mt-2">{planDetails.title}</p>
      <ul className="mt-4 space-y-2 text-gray-600">
        {planDetails.features.map((feature, i) => (
          <li key={i} className="text-sm">
            {feature}
          </li>
        ))}
      </ul>
      <Link href={`${pathname}/${planDetails.id}/checkout`}>
        <button className="mt-6 px-6 py-2 text-sm font-medium text-white bg-black transition-all rounded-full border-solid border-2 border-transparent hover:border-black hover:text-black hover:bg-white">
          Subscribe
        </button>
      </Link>
    </div>
  );
};

export default SubscriptionPlanCard;
