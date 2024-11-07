import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/config')));

// measurement page
const MeasurementPage = Loadable(lazy(() => import('views/meas/meas_status')));

// ==============================|| MAIN ROUTING ||============================== //

const ConfigRoutes = {
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
    }
  ]
};

export default ConfigRoutes;
