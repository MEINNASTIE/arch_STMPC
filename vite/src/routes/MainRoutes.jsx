import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import SemiLayout from 'layout/SemiLayout';
import ConfigMainFactory from 'views/config_factory';
import PrivateRoute from './PrivateRoute';

const FTPPage = Loadable(lazy(() => import('views/meas/ftp')));
const SystemStatus = Loadable(lazy(() => import('views/system/system_status')));
const SystemInfo = Loadable(lazy(() => import('views/system/system_info')));
const SystemStorage = Loadable(lazy(() => import('views/system/system_memory')));
const MeasurementPage = Loadable(lazy(() => import('views/meas/meas_status')));
const ConfigMain = Loadable(lazy(() => import('views/config')));

const MainRoutes = {
  path: '/',
  element: <PrivateRoute />,
  children: [
    {
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
          path: 'system-storage',
          element: <SystemStorage />
        },
        {
          path: 'conf',
          element: <ConfigMain />
        },
        {
          path: 'conf-factory',
          element: <ConfigMainFactory />
        },
        {
          path: 'measurement-status',
          element: <MeasurementPage />
        }
      ]
    }
  ]
};

export default MainRoutes;
