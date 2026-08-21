'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaGear, FaUser } from 'react-icons/fa6';
import { MdLogout } from 'react-icons/md';
import Link from 'next/link';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';
import ExpertProfileWithLogo from '@/components/common/ExpertProfileWithLogo';

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

  const isExpert = loggedInUser?.profile?.role === USER_ROLE.TEACHER;
  const profileSrc =
    loggedInUser?.profile?.image ||
    loggedInUser?.profile?.profile_image ||
    '/images/user/placeholder_profile.png';
  const displayName = loggedInUser?.profile?.first_name || '';

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={handleToggle}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-center lg:block">
          <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            Hi {displayName}
          </span>
          {/* <span className="block text-xs">{getRoleBaseTitle(loggedInUser?.profile?.role)}</span> */}
        </span>

        {isExpert ? (
          <ExpertProfileWithLogo
            src={profileSrc}
            logo={loggedInUser?.profile?.business_logo}
            name={displayName}
            size={48}
            logoSize={22}
            ringClassName="ring-2 ring-emerald-200/50 dark:ring-emerald-800/30 shadow-md shadow-emerald-200/20 dark:shadow-emerald-900/20"
            logoRingClassName="ring-2 ring-white dark:ring-gray-800"
            alt={displayName || 'Expert'}
          />
        ) : (
          <span className="h-12 w-12 rounded-full overflow-hidden transition-all duration-300 ring-2 ring-emerald-200/50 dark:ring-emerald-800/30 hover:ring-emerald-400/60 dark:hover:ring-emerald-600/50 shadow-md shadow-emerald-200/20 dark:shadow-emerald-900/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileSrc}
              alt="User"
              width={48}
              height={48}
              className="rounded-full object-cover w-full h-full"
            />
          </span>
        )}

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
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-xl border shadow-xl transition-all duration-200 ${
          dropdownOpen === true ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'
        } border-emerald-200/50 bg-white/95 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-gray-800/95 shadow-emerald-200/20 dark:shadow-emerald-900/20`}
      >
        <ul className="flex flex-col gap-5 border-b border-emerald-200/30 dark:border-emerald-800/20 px-6 py-4">
          {menu.map(menuItem => (
            <li key={menuItem.label}>
              {menuItem.onClick ? (
                <button
                  onClick={(e) => {
                    setDropdownOpen(false);
                    menuItem.onClick(e);
                  }}
                  className={`flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out lg:text-base w-full text-left rounded-lg px-2 py-1.5 transition-all ${
                    menuItem.label === 'Logout'
                      ? 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20'
                      : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  <menuItem.Icon size={20} />
                  {menuItem.label}
                </button>
              ) : (
                <Link
                  href={menuItem.href}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out lg:text-base rounded-lg px-2 py-1.5 transition-all hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20"
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
