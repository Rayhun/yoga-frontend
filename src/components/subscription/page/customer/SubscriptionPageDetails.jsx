'use client';
import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Slide from '@mui/material/Slide';
import SubscriptionPlanCard from '@/components/subscription/plan/customer/SubscriptionPlanCard';

const SubscriptionPageDetails = ({ data: pageDetails = {} }) => {
  const [selectedTenure, setSelectedTenure] = useState(pageDetails?.tenure?.[0]);

  const tenureOptions = useMemo(() => {
    const options = (pageDetails?.tenure || []).map(i => ({ label: i, value: i }));
    return options;
  }, [pageDetails?.tenure]);

  const filteredSubscriptionPlans = useMemo(
    () =>
      (pageDetails?.plans || []).filter(plan =>
        selectedTenure ? plan.subscription_tenure === selectedTenure : true
      ),
    [pageDetails?.plans, selectedTenure]
  );

  return (
    <div className="flex flex-col items-center gap-7 md:gap-10">
      <div className="text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">{pageDetails?.title}</h2>
      <p className="text-gray-900 text-3xl mt-9">{pageDetails?.description}</p>
      </div>

      <div className="flex border-2 border-[#8BC24A] bg-gray-100 rounded-full">
        {tenureOptions?.map(tenure => (
          <button
            key={tenure.value}
            className={`px-4 py-2 text-xs md:text-sm rounded-full transition-colors duration-300 ${
              selectedTenure === tenure.value ? 'bg-[#8BC24A] text-white' : 'text-gray-700'
            }`}
            onClick={() => setSelectedTenure(tenure.value)}
          >
            {tenure.label}
          </button>
        ))}
      </div>

      <Grid container spacing={6} justifyContent="center" className="w-full md:w-[80%]">
        {filteredSubscriptionPlans.map((plan, i) => (
          <Grid key={plan.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Slide in direction="right" timeout={300 + i * 300}>
              <div>
                <SubscriptionPlanCard
                  data={plan}
                  currencySymbol={pageDetails?.currency_symbol}
                  isFeatured={i == 1}
                />
              </div>
            </Slide>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default SubscriptionPageDetails;
