import { useState, useEffect } from 'react';
import { TIME_ZONES } from '@/utils/constants';


const useUserTimeZone = () => {
  const [userTimeZone, setUserTimeZone] = useState(null);
  const [mappedTimeZone, setMappedTimeZone] = useState(null);

  const getUserTimeZone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const getMappedTimeZone = (userTimeZone) => {
    return TIME_ZONES.find((zone) =>
      zone.utc.some((utc) => utc.includes(userTimeZone))
    );
  };

  useEffect(() => {
    const userTimeZone = getUserTimeZone();
    setUserTimeZone(userTimeZone);

    const mappedTimeZone = getMappedTimeZone(userTimeZone);
    setMappedTimeZone(mappedTimeZone);
  }, []);

  return { userTimeZone, mappedTimeZone };
};

export default useUserTimeZone;
