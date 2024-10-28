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

// system status page
const SystemStatus = Loadable(lazy(() => import('views/system/system_status')));

// system info page
const SystemInfo = Loadable(lazy(() => import('views/system/system_info')));

//system memory page
const SystemMemory = Loadable(lazy(() => import('views/system/system_memory')));

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
    {
      path: 'system-status',
          element: <SystemStatus />
    },
    {
      path: '/system-info',
          element: <SystemInfo />
    },
    {
      path: '/system-memory',
          element: <SystemMemory />
    }
  ]
};

export default MainRoutes;
