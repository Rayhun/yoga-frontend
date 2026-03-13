import { ExpertProvider } from '@/context/ExpertProfileContext';

export const metadata = {
  title: 'Profile Details',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;
