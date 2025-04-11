import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';
// import { enrollProgram } from '@/services/private/customer/program';
// import { useMutation } from '@tanstack/react-query';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';

// export const metadata = {
//   title: 'Payment Success',
// };

const Page = () => {
  // const searchParams = useSearchParams();
  // const router = useRouter();
  // const programID = searchParams.get("pg");

  // const { mutateAsync: enroll, isPending: isEnrolling } = useMutation({
  //   mutationFn: enrollProgram,
  // });

  // const handleEnrollProgram = async () => {
  //   try {
  //     await enroll({ id: programID });
  //     toast.success('Program enrolled successfully');
  //     router.push(`/portal/customer/lms/program/${programID}/details`);
  //   } catch (error) {
  //     toast.error('Something went wrong in enrolling the program');
  //   }
  // };

  // const renderButton = (
  //   <button
  //     onClick={handleEnrollProgram}
  //     className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/70 transition duration-300"
  //   >
  //     {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
  //   </button>
  // );

  return <SubscriptionStatus variant="success" />;
};

export default Page;
