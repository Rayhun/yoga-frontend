'use client';
import Link from 'next/link';
import DarkModeSwitcher from './DarkModeSwitcher';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import Image from 'next/image';

const Header = props => {
  return (
    <header className="sticky top-0 z-999 flex w-full shadow-lg transition-all duration-300 bg-gradient-to-r from-emerald-50/80 via-green-50/50 to-white dark:from-emerald-950/30 dark:via-green-950/20 dark:to-gray-900 border-b border-emerald-200/30 dark:border-emerald-800/20 backdrop-blur-sm">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-200/20 to-transparent rounded-l-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-green-200/15 to-transparent rounded-r-full blur-2xl pointer-events-none"></div>
      
      <div className="relative flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11 shadow-none">
        <div className="hidden lg:block" />

        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={e => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-lg p-1.5 shadow-sm transition-all duration-200 lg:hidden border border-emerald-200/50 bg-white/80 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-gray-800/80 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && 'delay-400 !w-full'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-[0]'
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-200'
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

{/*           <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image width={32} height={32} src={'/images/logo/logo-icon.svg'} alt="Logo" />
          </Link> */}
        </div>

        <div className="flex items-center self-end gap-3 2xsm:gap-7">
          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
