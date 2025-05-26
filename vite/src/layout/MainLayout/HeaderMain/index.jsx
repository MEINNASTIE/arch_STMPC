import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { IconPresentation, IconSettings, IconCpu, IconWorld, IconPrinter, IconRefresh, IconUser } from '@tabler/icons-react';
import usePrint from 'hooks/usePrint';
import { Button } from '@mui/material';
import useSerialNumber from 'context/SerialNumberContext';
import MobileHeader from './MobileHeader';

const HeaderMain = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { handlePrint } = usePrint();
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileHeader />;
  }

  const username = sessionStorage.getItem('username');
  const rolename = sessionStorage.getItem('rolename');

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

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('rolename');
    navigate('/');
  };

  const iconMenuOptions = [
    {
      icon: <IconPresentation stroke={1.5} size="1.9rem" />,
      label: 'Measurement status',
      path: '/measurement-status'
    },
    {
      icon: <IconSettings stroke={1.5} size="1.9rem" />,
      label: 'Configuration',
      options: [
        { label: 'Instrument configuration', path: '/conf' },
        { label: 'Factory configuration', path: '/conf-factory' },
        { label: 'Summary of changes', path: '/dashboard' }
      ]
    },
    {
      icon: <IconCpu stroke={1.5} size="1.9rem" />,
      label: 'System',
      options: [
        { label: 'System status', path: '/system-status' },
        { label: 'Storage', path: '/system-storage' },
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

  const { serialNumber, setSerialNumber } = useSerialNumber();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/config/runtime-desc");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setSerialNumber(data.mpcSN);  
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [setSerialNumber]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#3e4aec',
        borderRadius: '8px',
        marginTop: '1px',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'justify-between', alignItems: 'center', paddingLeft: '60px' }}>
        <Typography variant="h2" sx={{ flex: 1, color: 'white' }}>
          SpectroTRACER {serialNumber || ''}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',  
          borderRadius: '8px',
          padding: '4px 16px',
          borderLeft: '2px solid white',
          borderRight: '2px solid white',
          flex: 2,
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
                sx={{ cursor: 'pointer' }}
              >
                {options.map((option, i) => (
                  <MenuItem 
                    key={i} 
                    onClick={() => {
                      if (option.path) {
                        handleNavigation(option.path); 
                      } else {
                        console.log('Change language to', option.label);  
                        handleMenuClose();
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {username && rolename && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconUser stroke={1.5} size="1.2rem" style={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'white', paddingRight: '60px', fontWeight: 'bold' }}>
              {username} ({rolename})
            </Typography>
          </Box>
        )}
        <Button
          style={{
            color: 'white',
            padding: '5px',
            marginRight: '55px',
            width: '20%',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid white', 
          }}
          onClick={handleLogout}  
        >
          Log Out
        </Button>
      </Box>
    </Box>
  );
};

export default HeaderMain;
