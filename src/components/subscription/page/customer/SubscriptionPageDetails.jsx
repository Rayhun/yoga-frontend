'use client';
import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Slide from '@mui/material/Slide';
import SubscriptionPlanCard from '@/components/subscription/plan/customer/SubscriptionPlanCard';

const SubscriptionPageDetails = ({ data: pageDetails = {} }) => {
  const [selectedTenure, setSelectedTenure] = useState(pageDetails?.tenure?.[1]);

  const filteredSubscriptionPlans = useMemo(
    () => (pageDetails?.plans || []).filter(plan => plan.subscription_tenure),
    [pageDetails?.plans]
  );

  return (
    <div className="flex flex-col items-center gap-7 md:gap-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">{pageDetails?.title}</h2>
        <p className="text-gray-500">P{pageDetails?.description}</p>
      </div>

      <div className="flex border-2 border-primary bg-gray-100 rounded-full">
        {pageDetails?.tenure?.map(tenure => (
          <button
            key={tenure}
            className={`px-4 py-2 text-xs md:text-sm rounded-full transition-colors duration-300 ${
              selectedTenure === tenure ? 'bg-primary text-white' : 'text-gray-700'
            }`}
            onClick={() => setSelectedTenure(tenure)}
          >
            {tenure}
          </button>
        ))}
      </div>

      <Grid container spacing={6} justifyContent="center" className="w-full md:w-[80%]">
        {filteredSubscriptionPlans.map((plan, i) => (
          <Grid key={plan.id} size={4}>
            <Slide in direction="down" timeout={500 + i * 500}>
              <div>
                <SubscriptionPlanCard data={plan} />
              </div>
            </Slide>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default SubscriptionPageDetails;
