import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material';
import HeaderMain from 'layout/MainLayout/HeaderMain';
import Footer from 'layout/MainLayout/Footer';

// ==============================|| SEMI LAYOUT ||============================== //

const SemiLayout = () => {
  const theme = useTheme();

  const leftDrawerOpened = useSelector((state) => state.customization.opened);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh' 
    }}>
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <HeaderMain />
        </Toolbar>
      </AppBar>
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        pt: '10px',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default SemiLayout;
