import { ExpertProvider } from "@/context/ExpertProfileContext";

export const metadata = {
  title: 'Enrolled Consultations List',
};

const Layout = ({ children }) => {
  return <ExpertProvider>{children}</ExpertProvider>;
};

export default Layout;