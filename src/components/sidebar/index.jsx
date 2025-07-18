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

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("active_tab");
  const {
    user: {
      profile: { role: userRole, sub_role: userSubRole },
      isCustomer
    },
    logout,
  } = useAuthContext();

  const trigger = useRef();
  const sidebar = useRef();

  let storedSidebarExpanded = 'true';

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

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
    if (userRole === USER_ROLE.TEACHER) return SIDEBAR.TEACHER;
    if (userRole === USER_ROLE.AFFILIATE) return SIDEBAR.AFFILIATE;
    return SIDEBAR.CUSTOMER;
  }, [userRole]);

  const subRoleBasedSidebarMenuItems = useMemo(
    () =>
      roleBasedSidebarMenuItems
        .filter(item => {
          if (!item.permitted_sub_roles) return true;
          return item.permitted_sub_roles.includes(userSubRole);
        })
        .map(item => ({
          ...item,
          sub_menu: item.sub_menu?.filter(subMenuItem => {
            if (!subMenuItem.permitted_sub_roles) return true;
            return subMenuItem.permitted_sub_roles.includes(userSubRole);
          }),
        })),
    [roleBasedSidebarMenuItems, userSubRole]
  );

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-999 flex h-screen w-62.5 flex-col overflow-y-hidden bg-white shadow-[3px_0_5px_rgba(0,0,0,0.1)] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/">
          <Image
            src={'/images/logo/logo.png'}
            alt="Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="w-[80%] mx-auto"
            priority
          />
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

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear h-full">
        {/* Sidebar Menu */}
        <nav className="mt-3 px-4 py-4 lg:px-6 flex flex-col h-full">
          {/* Menu Group */}
          <ul className="flex-grow flex flex-col gap-2 mb-20">
            {subRoleBasedSidebarMenuItems.map(menuItem => (
              <React.Fragment key={menuItem.label}>
                {menuItem.sub_menu ? (
                  <ul className="flex flex-col gap-2">
                    <SidebarLinkGroup activeCondition={menuItem?.hasActiveSubMenu(pathname)}>
                      {(handleClick, open) => (
                        <>
                          <Link
                            href="#"
                            className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-nav-item duration-300 ease-in-out hover:text-primary"
                            onClick={e => {
                              e.preventDefault();
                              sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                            }}
                          >
                            {menuItem.Icon ? <menuItem.Icon size={24} /> : null}
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
                            <ul className="mb-3 mt-2 flex flex-col gap-2 pl-4">
                              {menuItem.sub_menu.map(childSubMenuItem => (
                                <li key={childSubMenuItem.label}>
                                  <Link
                                    href={childSubMenuItem.href || '#'}
                                    className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 pl-8 font-medium duration-300 ease-in-out hover:text-primary ${
                                      (
                                        childSubMenuItem.isActive
                                          ? childSubMenuItem.isActive(pathname, activeTab)
                                          : false
                                      )
                                        ? 'text-primary'
                                        : 'text-nav-item/90'
                                    }`}
                                  >
                                    {childSubMenuItem.Icon ? <childSubMenuItem.Icon size={24} /> : null}
                                    {childSubMenuItem.label}
                                  </Link>
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
                    <Link
                      href={menuItem.disabled ? '#' : menuItem.href || '#'}
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out 
                        ${menuItem.disabled ? 'cursor-not-allowed opacity-50 text-gray-400' : 'hover:text-primary'} 
                        ${menuItem.isActive?.(pathname, activeTab) ? 'text-primary' : 'text-nav-item'}`}
                      aria-disabled={menuItem.disabled} // Improves accessibility
                      tabIndex={menuItem.disabled ? -1 : 0} // Prevents focus when disabled
                    >

                      {menuItem.Icon && <menuItem.Icon size={24} />}
                      {menuItem.label}

                    </Link>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          {/* Logout */}
         {isCustomer && <li className="list-none mt-auto">
            <Link
              className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-nav-item duration-300 ease-in-out cursor-pointer hover:text-primary"
              href={'/portal/ai-chat?type=support'}
            >
              <MdOutlineContactSupport size={24} />
              Help & Support
            </Link>
          </li>}
          <li className="list-none mt-auto">
            <span
              className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-nav-item duration-300 ease-in-out cursor-pointer hover:text-primary"
              onClick={logout}
            >
              <MdLogout size={24} />
              Logout
            </span>
          </li>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
