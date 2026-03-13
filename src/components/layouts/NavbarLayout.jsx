import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import { SimpleNavbar } from '../navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <SimpleNavbar />
      <Toolbar />
      <main className="h-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default NavbarLayout;
