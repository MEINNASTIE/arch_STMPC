import LogoSection from 'layout/MainLayout/LogoSection';
import { Outlet } from 'react-router-dom';

// ==============================|| MINIMAL LAYOUT ||============================== //

const MinimalLayout = () => (
  <>
    <Outlet />
    <LogoSection />
  </>
);

export default MinimalLayout;
