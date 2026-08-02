import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import { SimpleNavbar } from '../navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden">
      <SimpleNavbar />
      <Toolbar />
      <main className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
};

export default NavbarLayout;
