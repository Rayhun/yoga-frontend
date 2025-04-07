import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Add Event',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;