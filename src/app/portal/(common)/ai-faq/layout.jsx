import AIFaqProvider from "@/context/AIFaqContext";

export const metadata = {
  title: 'Help & Support | Yoga App',
};

const Layout = ({ children }) => {
  return <AIFaqProvider>{children}</AIFaqProvider>;
};

export default Layout;
