import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Edit Consultation',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;