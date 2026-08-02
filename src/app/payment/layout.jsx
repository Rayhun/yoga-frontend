import NavbarLayout from '@/components/layouts/NavbarLayout';

const Layout = ({ children }) => {
  return (
    <NavbarLayout>
      <div className="min-h-0 w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 md:p-10">
        {children}
      </div>
    </NavbarLayout>
  );
};

export default Layout;
