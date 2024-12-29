'use client';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const Layout = ({ children }) => {
  useEffect(() => {
    Cookies.remove('token');
  }, []);

  return <div className="min-h-screen p-[10px] md:p-[50px]">{children}</div>;
};

export default Layout;
