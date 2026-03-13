import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Expert Consultation Details',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;