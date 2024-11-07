import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import LoginRoutes from './AuthenticationRoutes';
import ConfigRoutes from './ConfigRoutes';

// ==============================|| ROUTING RENDER ||============================== //
const router = createBrowserRouter([LoginRoutes, MainRoutes, ConfigRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
