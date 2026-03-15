import AICoachProvider from "@/context/AICoachContext";

export const metadata = {
  title: 'AI Coach | Yoga App',
};

const Layout = ({ children }) => {
  return <AICoachProvider>{children}</AICoachProvider>;
};

export default Layout;
