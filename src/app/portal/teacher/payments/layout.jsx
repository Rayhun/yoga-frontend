import { ExpertProvider } from '@/context/ExpertProfileContext';

export const metadata = {
  title: 'Payment Setup',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;
