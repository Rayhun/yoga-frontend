import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Edit Profile',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;
