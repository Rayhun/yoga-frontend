import ProgramCard from '@/components/lms/program/customer/ProgramCard';

const DATA = [
  {
    id: 70,
    title: 'Pelvic Wellness Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/11.%20Pelvic%20Floor_850927_1740648185.png',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 11,
    title: 'Demo - Menopause Self-Care Program',
    image:
      'https://nurishdoc.s3.amazonaws.com/media/file/uploader/Screenshot_2025-01-23_at_2.03.10AM_OBCRhpt.png',
    modules: 1,
    sessions: 5,
    experts: ['Dolores Fazzino', 'Expert Demo'],
  },
  {
    id: 75,
    title: 'Healthy Aging Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/12.%20Aging_885077_1740648185.png',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 76,
    title: 'Memory Wellness Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/13.%20Memory_183706_1740648185.png',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 77,
    title: 'Skin Wellness Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/14.Skin%20Care_740229_1740648185.png',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 78,
    title: 'Hair Wellness Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/15.%20Hair%20Loss_353673_1740648185.png',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 50,
    title: 'Menopause Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/1_ Menopause Journey_403815_1737671801.png',
    modules: 15,
    sessions: 8,
    experts: [
      'Catherine Harland',
      'Catherine Morgan',
      'Dr. Amanda Morelli',
      'Dr. Vikram Sinai Talaulikar',
      'Louise Carr',
      'Swati Madan',
    ],
  },
  {
    id: 51,
    title: 'Perimenopause Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/2_Perimenopause_Stories_937752_1737671802.png',
    modules: 15,
    sessions: 0,
    experts: [],
  },
  {
    id: 52,
    title: 'Hormone Balance Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/3. Balance Hormones_523580_1737671802.jpg',
    modules: 0,
    sessions: 0,
    experts: [],
  },
  {
    id: 53,
    title: 'Hot Flushes Self-Care Program',
    image: 'https://nurishdoc.s3.amazonaws.com/upload/4. Hot Flashes_243864_1737671801.jpg',
    modules: 0,
    sessions: 0,
    experts: [],
  },
];

const UserProfilePrograms = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {DATA.map(program => (
        <ProgramCard
          key={program.id}
          program={program}
          onClick={() => router.push(`/portal/customer/lms/program/${program.id}/details`)}
        />
      ))}
    </div>
  );
};

export default UserProfilePrograms;
