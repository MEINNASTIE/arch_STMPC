import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import SemiLayout from 'layout/SemiLayout';

// Page components
const FTPPage = Loadable(lazy(() => import('views/meas/ftp')));
const SystemStatus = Loadable(lazy(() => import('views/system/system_status')));
const SystemInfo = Loadable(lazy(() => import('views/system/system_info')));
const SystemMemory = Loadable(lazy(() => import('views/system/system_memory')));
const MeasurementPage = Loadable(lazy(() => import('views/meas/meas_status')));
const ConfigMain = Loadable(lazy(() => import('views/config')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <SemiLayout />, 
  children: [
    {
      path: 'ftp',
      element: <FTPPage />
    },
    {
      path: 'system-status',
      element: <SystemStatus />
    },
    {
      path: 'system-info',
      element: <SystemInfo />
    },
    {
      path: 'system-memory',
      element: <SystemMemory />
    },
    {
      path: 'conf',
      element: <ConfigMain />
    },
    {
      path: 'measurement-status',
      element: <MeasurementPage />
    }
  ]
};

export default MainRoutes;
