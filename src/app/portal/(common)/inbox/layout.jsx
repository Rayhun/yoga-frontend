import InboxProvider from '@/context/InboxContext';

export const metadata = {
  title: 'Inbox',
};

const Layout = ({ children }) => {
  return <InboxProvider>{children}</InboxProvider>;
};

export default Layout;
