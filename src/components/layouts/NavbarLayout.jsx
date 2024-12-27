import React from 'react';
import { SimpleNavbar } from '../navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <SimpleNavbar />
      <div>{children}</div>
    </div>
  );
};

export default NavbarLayout;
