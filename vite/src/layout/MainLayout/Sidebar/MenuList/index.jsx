// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { useNavigate } from 'react-router-dom';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const theme = useTheme();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/pages/login/login3');
  };

  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <Box>
      {navItems}
      <Box sx={{ mt: 2, cursor: 'pointer' }}>
        <Typography
          variant="caption"
          sx={{ ...theme.typography.menuCaption }}
          onClick={handleLogout}
          display="block"
          gutterBottom
        >
          Log out
        </Typography>
      </Box>
    </Box>
    </>
  );
};

export default MenuList;
