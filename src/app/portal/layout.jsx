import AuthProvider from '@/context/AuthProvider';

const Layout = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Layout;
