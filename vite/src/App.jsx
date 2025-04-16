import { useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import router from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import { SerialNumberProvider } from 'context/SerialNumberContext';
import { AuthProvider } from 'contexts/AuthContext';

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <AuthProvider>
      <SerialNumberProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={themes(customization)}>
            <CssBaseline />
            <NavigationScroll>
              <RouterProvider router={router} />
            </NavigationScroll>
          </ThemeProvider>
        </StyledEngineProvider>
      </SerialNumberProvider>
    </AuthProvider>
  );
};

export default App;
