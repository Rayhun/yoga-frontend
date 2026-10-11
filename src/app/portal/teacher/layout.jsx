import QteTrackGuard from '@/components/qte/QteTrackGuard';

// No teacher-level layout existed before: this is where QTE-track users are kept off Expert-only URLs.
const Layout = ({ children }) => <QteTrackGuard>{children}</QteTrackGuard>;

export default Layout;
