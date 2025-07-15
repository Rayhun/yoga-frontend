import InboxProvider from '@/context/InboxContext';

export const metadata = {
  title: 'AI Chat | Yoga App',
};

const Layout = ({ children }) => {
  return <InboxProvider>{children}</InboxProvider>;
};

export default Layout;