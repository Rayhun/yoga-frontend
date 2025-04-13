import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Add New Consultation',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;