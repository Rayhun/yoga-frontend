import React from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi';

const InfoNote = ({expertData}) => {
  return (
    <div className="mx-auto my-8">
      <div className="bg-white shadow rounded-lg border border-primary/20 p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <HiOutlineInformationCircle className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold text-primary">Quick Steps to Get Started</h2>
        </div>

        {/* Step 1 */}
        {!expertData?.is_profile_complete && <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
            1
          </div>
          <div className="flex-1 text-gray-800 font-medium">
            Complete your profile to continue working on the app.
          </div>
        </div>}

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
            {expertData?.is_profile_complete ? "1" : "2"}
          </div>
          <div className="flex-1 text-gray-800 font-medium">
            Add a group coaching or consultation to get started.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoNote;
