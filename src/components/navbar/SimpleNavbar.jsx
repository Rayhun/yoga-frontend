'use client';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeSwitcher from '../header/DarkModeSwitcher';

const SimpleNavbar = () => {
  return (
    <nav className="bg-white dark:bg-boxdark shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <Image width={176} height={32} src={'/images/logo/logo.svg'} alt="Logo" priority />
        </Link>

        <DarkModeSwitcher />
      </div>
    </nav>
  );
};

export default SimpleNavbar;
