'use client';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const Layout = ({ children }) => {
  useEffect(() => {
    Cookies.remove('token');
  }, []);

  return <div className="min-h-screen">{children}</div>;
};

export default Layout;
