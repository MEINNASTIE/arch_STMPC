import NavGroup from './NavGroup';
import menuItem from 'menu-items';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// assets
import { IconFileExport, IconClockHour5 } from '@tabler/icons-react';


// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
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
      <Box
          sx={{
            mt: 2,
            pl: 2, 
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption }}
            display="block"
            gutterBottom
          >
            Restart
          </Typography>
        </Box>

        <Divider sx={{ mt: 1.25, mb: 1.25 }} />
        {/* Where the List is supposed to go */}
        <Box
          sx={{
            mt: 2,
            pl: 2, 
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption }}
            display="block"
            gutterBottom
          >
            Change Password
          </Typography>
        </Box>

        <Box sx={{
            mt: 2,
            pl: 2,
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }} 
          onClick={handleLogout}>
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption }}
            display="block"
            gutterBottom
          >
            Log out
          </Typography>
        </Box>

        <Divider sx={{ mt: 1.25, mb: 1.25 }} />

        <Box sx={{
            mt: 2,
            pl: 2,
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          }}  
          >
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
             }}
            display="block"
            gutterBottom
          >
            <IconClockHour5 stroke={1.5} size="1.9rem" />
            <p style={{margin: 0}}>Set Time</p>
          </Typography>
        </Box>

        <Divider sx={{ mt: 1.25, mb: 1.25 }} />

        <Box sx={{ 
            mt: 2, 
            pl: 2,
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
            }, 
          }}>
          <Typography
            variant="caption"
            sx={{
              ...theme.typography.menuCaption,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            gutterBottom
          >
            <IconFileExport stroke={1.5} size="1.9rem" />
            <p style={{ margin: 0 }}>Send to System</p>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default MenuList;
