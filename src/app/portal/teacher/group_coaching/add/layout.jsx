import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Add Group Coaching',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;