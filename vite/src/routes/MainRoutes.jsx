import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import SemiLayout from 'layout/SemiLayout';

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
  element: <SemiLayout />,
  children: [
    {
      path: '/main',
      element: <MeasurementPage />
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
