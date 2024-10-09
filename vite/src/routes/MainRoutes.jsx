import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// measurement page
const MeasurementPage = Loadable(lazy(() => import('views/meas/meas_status')));

// ftp status page
const FTPPage = Loadable(lazy(() => import('views/meas/ftp')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/main',
      element: <MeasurementPage />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'ftp',
          element:  <FTPPage />
    },
  ]
};

export default MainRoutes;
