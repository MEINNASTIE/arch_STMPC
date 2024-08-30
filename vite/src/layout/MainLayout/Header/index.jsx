import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// assets
import { IconMenu2, IconPresentation, IconSettings, IconCpu, IconWorld, IconPrinter, IconRefresh } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();

  // State for dropdown menus (for future use)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column',
          alignItems: 'flex-start'
        }
      }}
    >
      {/* logo & toggler button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: 228,
          [theme.breakpoints.down('md')]: {
            width: 'auto',
            marginBottom: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '4px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              borderRadius: '10px',
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.main, 
                color: theme.palette.secondary.contrastText 
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* Navigation Icons with background and border radius */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 'auto',
          backgroundColor: theme.palette.primary.main,
          borderRadius: '8px',
          padding: '8px 16px',
          [theme.breakpoints.down('md')]: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }
        }}
      >
        {[
          { icon: <IconPresentation stroke={1.5} size="1.9rem" />, label: 'Measurement status' },
          { icon: <IconSettings stroke={1.5} size="1.9rem" />, label: 'Configuration' },
          { icon: <IconCpu stroke={1.5} size="1.9rem" />, label: 'System' },
          { icon: <IconWorld stroke={1.5} size="1.9rem" />, label: '' },
          { icon: <IconPrinter stroke={1.5} size="1.9rem" />, label: '' },
          { icon: <IconRefresh stroke={1.5} size="1.9rem" />, label: '' }
        ].map(({ icon, label }, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <IconButton
              sx={{
                p: 1,
                color: 'white',
                '&:hover': {
                  color: index === 5 ? theme.palette.success.light : theme.palette.primary.light,
                  backgroundColor: theme.palette.action.hover 
                }
              }}
              onClick={label ? handleMenuOpen : undefined} 
            >
              {icon}
            </IconButton>
            {label && (
              <Typography variant="caption" sx={{ ml: 0.5, color: 'white' }}>
                {label}
              </Typography>
            )}
          </Box>
        ))}

        {/* Dropdown Menu Example for one of the icons (optional) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            elevation: 1, 
            sx: {
              boxShadow: theme.shadows[2], 
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>Option 1</MenuItem>
          <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
          <MenuItem onClick={handleMenuClose}>Option 3</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
