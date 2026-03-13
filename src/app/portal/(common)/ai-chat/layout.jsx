import AIChatInboxProvider from "@/context/AIChatInboxContext";


export const metadata = {
  title: 'AI Chat | Yoga App',
};

const Layout = ({ children }) => {
  return <AIChatInboxProvider>{children}</AIChatInboxProvider>;
};

export default Layout;