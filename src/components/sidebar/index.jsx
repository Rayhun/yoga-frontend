'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuthContext from '@/hooks/useAuthContext';
import SidebarLinkGroup from './SidebarLinkGroup';
import SIDEBAR from '@/utils/sidebar';
import { USER_ROLE } from '@/utils/authorization';
import { MdLogout, MdOutlineContactSupport } from 'react-icons/md';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { FiUser, FiCreditCard, FiCalendar } from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('active_tab');
  const {
    user,
    logout,
  } = useAuthContext();
  
  const userRole = user?.profile?.role ?? '';
  const userSubRole = user?.profile?.sub_role ?? '';
  const is_profile_complete = user?.profile?.is_profile_complete ?? false;
  const has_event_or_consult = user?.profile?.has_event_or_consult ?? false;
  const stripe_onboarded = user?.profile?.stripe_onboarded ?? false;
  const isCustomer = user?.isCustomer ?? false;
  const isAffiliate = userRole === USER_ROLE.AFFILIATE;
  const shouldUseCustomerStyle = isCustomer || isAffiliate;

  const trigger = useRef();
  const sidebar = useRef();

  let storedSidebarExpanded = 'true';

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );
  const [showDashboardInfo, setShowDashboardInfo] = useState(false);
  const [modalAnimation, setModalAnimation] = useState(false);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const roleBasedSidebarMenuItems = useMemo(() => {
    if (userRole === USER_ROLE.ADMIN) return SIDEBAR.ADMIN;
    if (userRole === USER_ROLE.STAFF) return SIDEBAR.STAFF;
    if (userRole === USER_ROLE.TEACHER) return SIDEBAR.getTeacherSidebarMenuItems(is_profile_complete, has_event_or_consult, stripe_onboarded);
    if (userRole === USER_ROLE.AFFILIATE) return SIDEBAR.AFFILIATE;
    if (userRole === USER_ROLE.INSTITUTION) return SIDEBAR.INSTITUTION;
    return SIDEBAR.CUSTOMER;
  }, [userRole, is_profile_complete, has_event_or_consult, stripe_onboarded]);

  // Remove unused isTeacher variable - design is now universal

  // const disabledSidebarMenu = useMemo(() => {
  //   return (
  //     userRole === USER_ROLE.TEACHER && (!is_profile_complete || !has_event_or_consult)
  //   );
  // }, [userRole, is_profile_complete, has_event_or_consult]);

  const subRoleBasedSidebarMenuItems = useMemo(
    () =>
      roleBasedSidebarMenuItems
        .filter(item => {
          if (!item.permitted_sub_roles) return true;
          if (!item.permitted_sub_roles.includes(userSubRole)) return false;
          
          // Check if item is business owner only
          if (item.isBusinessOwnerOnly) {
            return user?.isBusinessOwner;
          }
          
          return true;
        })
        .map(item => ({
          ...item,
          sub_menu: item.sub_menu?.filter(subMenuItem => {
            if (!subMenuItem.permitted_sub_roles) return true;
            return subMenuItem.permitted_sub_roles.includes(userSubRole);
          }),
        })),
    [roleBasedSidebarMenuItems, userSubRole, user?.isBusinessOwner]
  );

  const handleDisabledDashboardClick = (e) => {
    e.preventDefault();
    setShowDashboardInfo(true);
    // Trigger animation after modal is shown
    setTimeout(() => setModalAnimation(true), 10);
  };

  const closeModal = () => {
    setModalAnimation(false);
    setTimeout(() => setShowDashboardInfo(false), 200);
  };

  const getMissingRequirements = () => {
    const missing = [];
    if (!is_profile_complete) missing.push({ text: 'Complete your profile', icon: FiUser });
    if (!has_event_or_consult) missing.push({ text: 'Add guided experiences', icon: FiCalendar });
    if (!stripe_onboarded) missing.push({ text: 'Set up your PayPal account', icon: FiCreditCard });
    return missing;
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showDashboardInfo) {
        closeModal();
      }
    };

    if (showDashboardInfo) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showDashboardInfo]);


  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-999 flex h-screen w-62.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900 border-r border-emerald-200/30 dark:border-emerald-800/20 shadow-[4px_0_12px_rgba(16,185,129,0.08)]`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100/30 via-green-100/15 to-transparent rounded-full blur-2xl pointer-events-none"></div>

      {/* <!-- SIDEBAR HEADER --> */}
      <div className="relative flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 border-b border-emerald-200/30 dark:border-emerald-800/20">
        <Link href="/">
          <div className={`transition-all duration-300 ${shouldUseCustomerStyle ? 'hover:scale-105 hover:rotate-1' : ''}`}>
            <Image
              src={'/images/logo/logo.png'}
              alt="Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-[80%] mx-auto"
              priority
            />
          </div>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {/* Sidebar Menu */}
        <nav className={`mt-3 px-4 py-4 lg:px-6 flex flex-col h-full ${
          shouldUseCustomerStyle ? 'gap-1' : ''
        }`}>
          {/* Menu Group */}
          <ul className={`flex-grow flex flex-col mb-4 ${
            shouldUseCustomerStyle ? 'gap-1' : 'gap-2'
          }`}>
            {subRoleBasedSidebarMenuItems.map(menuItem => (
              <React.Fragment key={menuItem.label}>
                {menuItem.sub_menu ? (
                  <ul className="flex flex-col gap-2">
                    <SidebarLinkGroup activeCondition={menuItem?.hasActiveSubMenu(pathname)}>
                      {(handleClick, open) => (
                        <>
                          <Link
                            href="#"
                            className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out transition-all ${
                              shouldUseCustomerStyle 
                                ? 'text-gray-700 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-green-50/80 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400' 
                                : 'text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-green-50/80 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400'
                            }`}
                            onClick={e => {
                              e.preventDefault();
                              sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                            }}
                          >
                            {menuItem.Icon ? (
                              <div className={`transition-transform duration-300 ${shouldUseCustomerStyle ? 'group-hover:scale-110 group-hover:rotate-3' : ''}`}>
                                <menuItem.Icon size={24} />
                              </div>
                            ) : null}
                            {menuItem.label}
                            <svg
                              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                open && 'rotate-180'
                              }`}
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                fill=""
                              />
                            </svg>
                          </Link>
                          <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                            <ul className={`mb-3 mt-2 flex flex-col pl-4 ${
                              shouldUseCustomerStyle ? 'gap-1' : 'gap-2'
                            }`}>
                              {menuItem.sub_menu.map(childSubMenuItem => (
                                <li key={childSubMenuItem.label}>
                                  {childSubMenuItem.sub_menu ? (
                                    <SidebarLinkGroup activeCondition={childSubMenuItem?.hasActiveSubMenu ? childSubMenuItem.hasActiveSubMenu(pathname) : false}>
                                      {(handleClick, isNestedOpen) => (
                                        <>
                                          <Link
                                            href="#"
                                            className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 pl-8 font-medium duration-300 ease-in-out transition-all ${
                                              (
                                                childSubMenuItem.isActive
                                                  ? childSubMenuItem.isActive(pathname, activeTab)
                                                  : false
                                              )
                                                ? 'text-emerald-700 dark:text-emerald-400 bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/20 shadow-[0_2px_8px_rgba(16,185,129,0.2)] scale-[1.01] border-l-2 border-emerald-500'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-green-50/60 hover:shadow-[0_2px_6px_rgba(16,185,129,0.12)] hover:scale-[1.01] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400/50'
                                            }`}
                                            onClick={e => {
                                              e.preventDefault();
                                              handleClick();
                                            }}
                                          >
                                            {childSubMenuItem.Icon ? (
                                              <div className={`transition-transform duration-300 ${shouldUseCustomerStyle ? 'group-hover:scale-110 group-hover:rotate-2' : ''}`}>
                                                <childSubMenuItem.Icon size={20} />
                                              </div>
                                            ) : null}
                                            {childSubMenuItem.label}
                                            <svg
                                              className={`ml-auto fill-current ${
                                                isNestedOpen && 'rotate-180'
                                              }`}
                                              width="16"
                                              height="16"
                                              viewBox="0 0 20 20"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                                fill=""
                                              />
                                            </svg>
                                          </Link>
                                          <div className={`translate transform overflow-hidden ${!isNestedOpen && 'hidden'}`}>
                                            <ul className={`mb-2 mt-1 flex flex-col pl-4 ${
                                              shouldUseCustomerStyle ? 'gap-1' : 'gap-1'
                                            }`}>
                                              {childSubMenuItem.sub_menu.map(nestedItem => (
                                                <li key={nestedItem.label}>
                                                  <Link
                                                    href={nestedItem.href || '#'}
                                                    className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 pl-12 font-medium duration-300 ease-in-out transition-all ${
                                                      (
                                                        nestedItem.isActive
                                                          ? nestedItem.isActive(pathname, activeTab)
                                                          : false
                                                      )
                                                        ? 'text-emerald-700 dark:text-emerald-400 bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/20 shadow-[0_2px_8px_rgba(16,185,129,0.2)] scale-[1.01] border-l-2 border-emerald-500'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-green-50/60 hover:shadow-[0_2px_6px_rgba(16,185,129,0.12)] hover:scale-[1.01] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400/50'
                                                    }`}
                                                  >
                                                    {nestedItem.Icon ? (
                                                      <div className={`transition-transform duration-300 ${shouldUseCustomerStyle ? 'group-hover:scale-110 group-hover:rotate-2' : ''}`}>
                                                        <nestedItem.Icon size={18} />
                                                      </div>
                                                    ) : null}
                                                    {nestedItem.label}
                                                  </Link>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </>
                                      )}
                                    </SidebarLinkGroup>
                                  ) : (
                                    <Link
                                      href={childSubMenuItem.href || '#'}
                                      className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 pl-8 font-medium duration-300 ease-in-out transition-all ${
                                        (
                                          childSubMenuItem.isActive
                                            ? childSubMenuItem.isActive(pathname, activeTab)
                                            : false
                                        )
                                          ? 'text-emerald-700 dark:text-emerald-400 bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/20 shadow-[0_2px_8px_rgba(16,185,129,0.2)] scale-[1.01] border-l-2 border-emerald-500'
                                          : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-green-50/60 hover:shadow-[0_2px_6px_rgba(16,185,129,0.12)] hover:scale-[1.01] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400/50'
                                      }`}
                                    >
                                      {childSubMenuItem.Icon ? (
                                        <div className={`transition-transform duration-300 ${shouldUseCustomerStyle ? 'group-hover:scale-110 group-hover:rotate-2' : ''}`}>
                                          <childSubMenuItem.Icon size={24} />
                                        </div>
                                      ) : null}
                                      {childSubMenuItem.label}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </SidebarLinkGroup>
                  </ul>
                ) : (
                  <li className="list-none">
                    {menuItem.label === 'Dashboard' && menuItem.disabled ? (
                      <button
                        onClick={handleDisabledDashboardClick}
                        className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out w-full text-left
                          cursor-pointer opacity-50 text-gray-400 hover:opacity-70`}
                        aria-disabled={true}
                      >
                        {menuItem.Icon && <menuItem.Icon size={24} />}
                        {menuItem.label}
                      </button>
                    ) : (
                      <Link
                        href={menuItem.disabled ? '#' : menuItem.href || '#'}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out transition-all
                          ${
                            menuItem.disabled
                              ? 'cursor-not-allowed opacity-50 text-gray-400'
                              : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-green-50/80 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400'
                          } 
                          ${menuItem.isActive?.(pathname, activeTab) 
                            ? 'text-emerald-700 dark:text-emerald-400 bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/20 shadow-[0_2px_8px_rgba(16,185,129,0.2)] scale-[1.01] border-l-2 border-emerald-500'
                            : 'text-gray-700 dark:text-gray-300'
                          }`}
                        aria-disabled={menuItem.disabled} // Improves accessibility
                        tabIndex={menuItem.disabled ? -1 : 0} // Prevents focus when disabled
                      >
                        {menuItem.Icon && (
                          <div className={`transition-transform duration-300 ${shouldUseCustomerStyle ? 'group-hover:scale-110 group-hover:rotate-3' : ''}`}>
                            <menuItem.Icon size={24} />
                          </div>
                        )}
                        {menuItem.label}
                      </Link>
                    )}
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          {/* Logout */}
          {isCustomer && (
            <li className="list-none mt-auto">
              <Link
                className="group relative flex items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out cursor-pointer transition-all text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-green-50/80 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-x-1 border-l-2 border-transparent hover:border-emerald-400"
                href={'/portal/help-support'}
              >
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <MdOutlineContactSupport size={24} />
                </div>
                Help & Support
              </Link>
            </li>
          )}
          <li className="list-none mt-auto">
            <span
              className="group relative flex items-center gap-2.5 rounded-xl px-4 py-3 font-medium duration-300 ease-in-out cursor-pointer transition-all text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:scale-[1.02] hover:-translate-x-1 border-l-2 border-transparent hover:border-red-400"
              onClick={logout}
            >
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <MdLogout size={24} />
              </div>
              Logout
            </span>
          </li>
          {/* Bottom padding to ensure scrollbar doesn't cover content */}
          <div className="pb-4"></div>
        </nav>
      </div>

      {/* Dashboard Info Modal */}
    </aside>
  );
};

export default Sidebar;
