'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaGear, FaUser } from 'react-icons/fa6';
import { MdLogout } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';

const getRoleBaseTitle = (role) => {

  if (role === USER_ROLE.TEACHER) return 'Wellness Expert';

  return role;
}


const DropdownUser = () => {
  const { user: loggedInUser, logout } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef();
  const dropdown = useRef();
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current || !trigger.current) return;
      // If clicking on trigger or dropdown, don't close (let the toggle handle it)
      if (trigger.current.contains(target) || dropdown.current.contains(target)) return;
      // Otherwise, close the dropdown
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  const url = useMemo(() => {
    const { role } = loggedInUser?.profile || {}; 
    if (role === USER_ROLE.ADMIN) return '#';
    if (role === USER_ROLE.STAFF) return '#'; // Staff users don't have profile page
    if (role === USER_ROLE.TEACHER) return '/portal/teacher/profile?active_tab=about';
    if (role === USER_ROLE.AFFILIATE) return '/portal/affiliate/profle';
    if (role === USER_ROLE.CUSTOMER) return '/portal/customer/profile';
    return '#'; // Default fallback
  }, [loggedInUser?.profile]);

  const settingsUrl = useMemo(() => {
    const { role } = loggedInUser?.profile || {};
    if (role === USER_ROLE.CUSTOMER) return '/portal/customer/subscriptions';
    return '#';
  }, [loggedInUser?.profile]);

  const menu = [
    {
      label: 'My Profile',
      href: url,
      Icon: FaUser,
    },
    {
      label: 'Settings',
      href: settingsUrl,
      Icon: FaGear,
    },
    {
      label: 'Logout',
      href: '#',
      Icon: MdLogout,
      onClick: logout,
    },
  ];

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={handleToggle}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {loggedInUser?.profile?.first_name} {loggedInUser?.profile?.last_name}
          </span>
          <span className="block text-xs">{getRoleBaseTitle(loggedInUser?.profile?.role)}</span>
        </span>

        <span className="h-12 w-12 rounded-full overflow-hidden">
          <Image
            width={48}
            height={48}
            src={loggedInUser?.profile?.image || loggedInUser?.profile?.profile_image || '/images/user/placeholder_profile.png'}
            alt="User"
            className="rounded-full object-cover w-full h-full"
            quality={95}
            priority
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? 'block' : 'hidden'
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-4 dark:border-strokedark">
          {menu.map(menuItem => (
            <li key={menuItem.label}>
              {menuItem.onClick ? (
                <button
                  onClick={(e) => {
                    setDropdownOpen(false);
                    menuItem.onClick(e);
                  }}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base w-full text-left"
                >
                  <menuItem.Icon size={20} />
                  {menuItem.label}
                </button>
              ) : (
                <Link
                  href={menuItem.href}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                >
                  <menuItem.Icon size={20} />
                  {menuItem.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;
