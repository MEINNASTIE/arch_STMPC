import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// assets
import { IconPresentation, IconSettings, IconCpu, IconWorld, IconPrinter, IconRefresh } from '@tabler/icons-react';
import usePrint from 'hooks/usePrint';

const HeaderMain = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { handlePrint } = usePrint();

  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setHoveredIcon(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setHoveredIcon(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const iconMenuOptions = [
    {
      icon: <IconPresentation stroke={1.5} size="1.9rem" />,
      label: 'Measurement status',
      path: '/config/main', // Correct path for Measurement status
    },
    {
      icon: <IconSettings stroke={1.5} size="1.9rem" />,
      label: 'Configuration',
      options: [
        { label: 'Instrument configuration', path: '/config/dashboard/default' },
        { label: 'Summary of changes', path: '/config/dashboard/default' }, // You can change this to the actual path
      ]
    },
    {
      icon: <IconCpu stroke={1.5} size="1.9rem" />,
      label: 'System',
      options: [
        { label: 'System status', path: '/system-status' },
        { label: 'Memory', path: '/system-memory' },
        { label: 'System info', path: '/system-info' }
      ]
    },
    {
      icon: <IconWorld stroke={1.5} size="1.9rem" />,
      options: [
        { label: 'English' },
        { label: 'German' },
        { label: 'French' },
        { label: 'Russian' },
      ]
    },
    {
      icon: <IconPrinter stroke={1.5} size="1.9rem" />,
      onClick: handlePrint
    },
    {
      icon: <IconRefresh stroke={1.5} size="1.9rem" />,
      onClick: handleRefresh,
    }
  ];

  const handleNavigation = (path) => { 
    if (path) {
      navigate(path);
      handleMenuClose();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'row',
          justifyContent: 'space-between'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 'auto',
          backgroundColor: theme.palette.primary.main,
          borderRadius: '8px',
          padding: '8px 16px',
          [theme.breakpoints.down('md')]: {
            padding: '4px 8px',
          }
        }}
      >
        {iconMenuOptions.map(({ icon, label, options, onClick, path }, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'center', ml: 1, position: 'relative' }}
            onMouseEnter={(event) => handleMenuOpen(event, index)}
            onMouseLeave={handleMenuClose}
            onClick={onClick || (path ? () => handleNavigation(path) : undefined)} 
          >
            <IconButton
              sx={{
                p: 1,
                color: 'white',
                '&:hover': {
                  color: index === 5 ? theme.palette.success.light : theme.palette.primary.light,
                  backgroundColor: theme.palette.action.hover
                }
              }}
              aria-controls={hoveredIcon === index && options ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={hoveredIcon === index && options ? 'true' : undefined}
            >
              {icon}
            </IconButton>
            {label && (
              <Typography
                variant="caption"
                sx={{
                  ml: 0.5,
                  color: 'white',
                  [theme.breakpoints.down('md')]: {
                    display: 'none',
                  },
                }}
              >
                {label}
              </Typography>
            )}

            {options && hoveredIcon === index && (
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && hoveredIcon === index}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                  onMouseLeave: handleMenuClose,
                }}
              >
                {options.map((option, i) => (
                  <MenuItem key={i} onClick={() => {
                    if (option.path) {
                      handleNavigation(option.path); 
                    } else {
                      console.log('Change language to', option.label);  
                      handleMenuClose();
                    }
                  }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HeaderMain;
