import PropTypes from 'prop-types';
import React, { useState } from 'react';

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
import usePrint from 'hooks/usePrint';

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();

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
    },
    {
      icon: <IconSettings stroke={1.5} size="1.9rem" />,
      label: 'Configuration',
      options: [
        { label: 'Instrument configuration' },
        { label: 'Summary of changes' },
      ]
    },
    {
      icon: <IconCpu stroke={1.5} size="1.9rem" />,
      label: 'System',
      options: [
        { label: 'System status' },
        { label: 'Memory' },
        { label: 'System info' }
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
        {iconMenuOptions.map(({ icon, label, options, onClick }, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'center', ml: 1, position: 'relative' }}
            onMouseEnter={(event) => handleMenuOpen(event, index)} 
            onMouseLeave={handleMenuClose} 
            onClick={onClick} 
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
                PaperProps={{
                  elevation: 1, 
                  sx: {
                    boxShadow: theme.shadows[2],
                    [theme.breakpoints.down('md')]: {
                      width: '100%', 
                    },
                  },
                }}
              >
                {options.map((option, optIndex) => (
                  <MenuItem key={optIndex} onClick={handleMenuClose}>
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

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
