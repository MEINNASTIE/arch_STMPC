import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import SemiLayout from 'layout/SemiLayout';
import MainLayout from 'layout/MainLayout';

// Page components
const FTPPage = Loadable(lazy(() => import('views/meas/ftp')));
const SystemStatus = Loadable(lazy(() => import('views/system/system_status')));
const SystemInfo = Loadable(lazy(() => import('views/system/system_info')));
const SystemMemory = Loadable(lazy(() => import('views/system/system_memory')));
const MeasurementPage = Loadable(lazy(() => import('views/meas/meas_status')));
const DashboardDefault = Loadable(lazy(() => import('views/config')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: 'ftp',
      element: <SemiLayout><FTPPage /></SemiLayout>
    },
    {
      path: 'system-status',
      element: <SemiLayout><SystemStatus /></SemiLayout>
    },
    {
      path: 'system-info',
      element: <SemiLayout><SystemInfo /></SemiLayout>
    },
    {
      path: 'system-memory',
      element: <SemiLayout><SystemMemory /></SemiLayout>
    },

    {
      path: 'config',
      element: <MainLayout />, 
      children: [
        {
          path: 'main',
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
    }
  ]
};

export default MainRoutes;
