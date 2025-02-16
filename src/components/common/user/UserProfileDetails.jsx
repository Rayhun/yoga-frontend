import { DetailsRecord } from '../details';

const UserProfileDetails = ({ data: userProfileDetails }) => {
  return (
    <div className="flex flex-col gap-5">
      <DetailsRecord label="First Name">{userProfileDetails?.first_name}</DetailsRecord>
      <DetailsRecord label="Last Name">{userProfileDetails?.last_name}</DetailsRecord>
      <DetailsRecord label="Phone">{userProfileDetails?.mobile_number}</DetailsRecord>
      <DetailsRecord label="Role">{userProfileDetails?.role}</DetailsRecord>
      <DetailsRecord label="Sub Role">{userProfileDetails?.sub_role}</DetailsRecord>
    </div>
  );
};

export default UserProfileDetails;
