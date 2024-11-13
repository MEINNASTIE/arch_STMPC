import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material';
import HeaderMain from 'layout/MainLayout/HeaderMain';
import LogoSection from 'layout/MainLayout/LogoSection';

// ==============================|| SEMI LAYOUT ||============================== //

const SemiLayout = () => {
  const theme = useTheme();

  const leftDrawerOpened = useSelector((state) => state.customization.opened);

  return (
  <>
  <Box sx={{ display: 'flex', margin: '1px',
      borderRadius: '10px' }}>
        <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
        }}
      >
        <Toolbar>
          <HeaderMain />
        </Toolbar>
        </AppBar>
      <Outlet />
  </Box>
  <LogoSection />
  </>
);
};

export default SemiLayout;
