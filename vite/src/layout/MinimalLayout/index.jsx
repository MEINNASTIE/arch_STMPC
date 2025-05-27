import { Outlet } from 'react-router-dom';
import Footer from 'layout/MainLayout/Footer';
import { Box } from '@mui/material';

const MinimalLayout = () => {

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MinimalLayout;
