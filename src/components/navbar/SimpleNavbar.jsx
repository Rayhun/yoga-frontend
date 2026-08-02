'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { MdMenu } from 'react-icons/md';
import Toolbar from '@mui/material/Toolbar';

const SimpleNavbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOnboardingPaymentSuccess = pathname === '/payment/success';

  const handleDrawerToggle = () => {
    setMobileOpen(prevState => !prevState);
  };

  return (
    <div>
      <AppBar
        component="nav"
        elevation={0}
        sx={{
          backgroundColor: isOnboardingPaymentSuccess ? '#f6fbf9' : undefined,
          backgroundImage: isOnboardingPaymentSuccess ? 'none' : undefined,
        }}
      >
        <Toolbar
          className={`relative w-full h-full flex justify-center ${
            isOnboardingPaymentSuccess
              ? 'bg-[#f6fbf9] !pt-4 dark:bg-gray-950'
              : 'bg-white dark:bg-boxdark'
          }`}
        >
          {!isOnboardingPaymentSuccess ? (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              className="absolute left-2 sm:!hidden"
            >
              <MdMenu className="text-bodydark dark:text-white" />
            </IconButton>
          ) : null}
          <Link
            href="/"
            className={isOnboardingPaymentSuccess ? 'mt-2 sm:mt-4' : undefined}
          >
            <Image
              width={isOnboardingPaymentSuccess ? 220 : 176}
              height={isOnboardingPaymentSuccess ? 40 : 32}
              src={'/images/logo/logo.png'}
              className={
                isOnboardingPaymentSuccess
                  ? 'h-12 w-auto sm:h-16'
                  : 'h-7 w-auto sm:h-8'
              }
              alt="Logo"
              priority
              quality={95}
            />
          </Link>
          {/* <div className="hidden sm:flex sm:items-center sm:gap-5">
            {NAVBAR.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-3 py-5 font-medium duration-300 ease-linear before:absolute before:bottom-0 before:left-0 before:h-1 before:w-0 before:bg-primary before:duration-300 before:ease-linear hover:text-primary hover:before:w-full ${
                  item.isActive(pathname) ? 'before:w-full' : ''
                }`}
              >
                <p className="text-gray-500 dark:text-white">{item.label}</p>
              </Link>
            ))}
          </div> */}
        </Toolbar>
      </AppBar>
      {!isOnboardingPaymentSuccess ? (
        <nav>
          <Drawer
            container={document.body}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            PaperProps={{
              className: 'bg-white dark:bg-boxdark p-3',
            }}
            className="sm:!hidden"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
            }}
          >
            <div onClick={handleDrawerToggle} className="flex flex-col items-center gap-3">
              <Link href="/">
                <Image
                  width={176}
                  height={32}
                  src={'/images/logo/logo.png'}
                  className="my-3"
                  alt="Logo"
                  priority
                  quality={95}
                />
              </Link>
              <br />
            </div>
          </Drawer>
        </nav>
      ) : null}
    </div>
  );
};

export default SimpleNavbar;
