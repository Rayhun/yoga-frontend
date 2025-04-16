import React from 'react';
import UserProfileAbout from '@/components/common/user/profile/about';

const ExpertProfileAbout = ({ data }) => {
  return <UserProfileAbout data={data} isExpertView/>;
};

export default ExpertProfileAbout;
