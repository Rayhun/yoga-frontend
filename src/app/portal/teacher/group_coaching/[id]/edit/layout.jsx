import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Group Coaching Details',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;