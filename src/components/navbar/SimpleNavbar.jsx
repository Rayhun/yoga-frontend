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
import NAVBAR from '@/utils/navbar';

const SimpleNavbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(prevState => !prevState);
  };

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <div className="flex">
      <AppBar component="nav">
        <Toolbar className="bg-white dark:bg-boxdark flex justify-between">
          <IconButton edge="start" onClick={handleDrawerToggle} className="mr-3 sm:hidden">
            <MdMenu className="text-bodydark dark:text-white" />
          </IconButton>
          {/* Logo */}
          <Link href="/">
            <Image
              width={176}
              height={32}
              src={'/images/logo/logo.svg'}
              className="hidden sm:block"
              alt="Logo"
              priority
            />
          </Link>
          <div className="hidden sm:flex sm:items-center sm:gap-5">
            {NAVBAR.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-3 py-5 font-medium duration-300 ease-linear before:absolute before:bottom-0 before:left-0 before:h-1 before:w-0 before:bg-primary before:duration-300 before:ease-linear hover:text-primary hover:before:w-full ${
                  item.isActive(pathname) ? 'before:w-full' : ''
                }`}
              >
                <p className="text-bodydark dark:text-white">{item.label}</p>
              </Link>
            ))}
          </div>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            className: 'bg-white dark:bg-boxdark p-3',
          }}
          className="sm:hidden"
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
          }}
        >
          <div onClick={handleDrawerToggle} className="flex flex-col items-center gap-3">
            <Link href="/">
              <Image
                width={176}
                height={32}
                src={'/images/logo/logo.svg'}
                className="my-3"
                alt="Logo"
                priority
              />
            </Link>
            <br />
            <div className="w-full flex flex-col items-center text-center">
              {NAVBAR.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full p-3 hover:bg-primary/5 ${
                    item.isActive(pathname) ? 'bg-primary/20 hover:bg-primary/20' : ''
                  }`}
                  inlist
                >
                  <p className="text-body dark:text-white">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </Drawer>
      </nav>
    </div>
  );
};

export default SimpleNavbar;
