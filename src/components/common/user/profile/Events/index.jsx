import { useState } from 'react';
import Spinner from '@/components/common/loader/Spinner';
import EventCard from '@/components/lms/common/EventCard';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

const EVENT_DATA = [
    {
      id: 70,
      title: 'Pelvic Wellness Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/11.%20Pelvic%20Floor_850927_1740648185.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Pelvic Wellness.',
      date: '2025-04-06',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 11,
      title: 'Demo - Menopause Event',
      image: 'https://nurishdoc.s3.amazonaws.com/media/file/uploader/Screenshot_2025-01-23_at_2.03.10AM_OBCRhpt.png',
      organizer: 'Dolores Fazzino',
      agenda: 'An insightful discussion on Demo - Menopause.',
      date: '2025-04-07',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 75,
      title: 'Healthy Aging Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/12.%20Aging_885077_1740648185.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Healthy Aging.',
      date: '2025-04-08',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 76,
      title: 'Memory Wellness Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/13.%20Memory_183706_1740648185.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Memory Wellness.',
      date: '2025-04-09',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 77,
      title: 'Skin Wellness Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/14.Skin%20Care_740229_1740648185.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Skin Wellness.',
      date: '2025-04-10',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 78,
      title: 'Hair Wellness Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/15.%20Hair%20Loss_353673_1740648185.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Hair Wellness.',
      date: '2025-04-11',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 50,
      title: 'Menopause Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/1_ Menopause Journey_403815_1737671801.png',
      organizer: 'Catherine Harland',
      agenda: 'An insightful discussion on Menopause.',
      date: '2025-04-12',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 51,
      title: 'Perimenopause Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/2_Perimenopause_Stories_937752_1737671802.png',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Perimenopause.',
      date: '2025-04-13',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 52,
      title: 'Hormone Balance Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/3. Balance Hormones_523580_1737671802.jpg',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Hormone Balance.',
      date: '2025-04-14',
      time: '18:00',
      duration: '1h',
    },
    {
      id: 53,
      title: 'Hot Flushes Event',
      image: 'https://nurishdoc.s3.amazonaws.com/upload/4. Hot Flashes_243864_1737671801.jpg',
      organizer: 'HealthCare Org',
      agenda: 'An insightful discussion on Hot Flushes.',
      date: '2025-04-15',
      time: '18:00',
      duration: '1h',
    },
  ];
  

const UserProfileEvents = () => {
  const isLoadingEvents = false; // Simulating loading state
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const filteredEvents = EVENT_DATA.filter(program =>
    program.title.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
      <div className="flex gap-4 items-center justify-end">
        <input
          className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          placeholder="Search Programs"
          onChange={e => setSearchText(e.target.value || '')}
        />
        <Button size='lg' onClick={() => router.push('/portal/teacher/event/add')}>+</Button>
      </div>
      {isLoadingEvents ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => console.log(`Clicked ${event.title}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfileEvents;
