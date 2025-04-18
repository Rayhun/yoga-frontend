import { ExpertProvider } from '@/context/ExpertProfileContext';

export const metadata = {
  title: 'Upload Programs',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;
