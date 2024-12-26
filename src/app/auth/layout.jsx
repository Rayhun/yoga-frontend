'use client';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const Layout = ({ children }) => {
  useEffect(() => {
    Cookies.remove('token');
  }, []);

  return children;
};

export default Layout;
