import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Expert Profile Details',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;
