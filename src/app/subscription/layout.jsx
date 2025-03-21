import NavbarLayout from '@/components/layouts/NavbarLayout';

const Layout = ({ children }) => {
  return (
    <NavbarLayout>
      <div className="p-10 min-h-screen bg-white">{children}</div>
    </NavbarLayout>
  );
};

export default Layout;
