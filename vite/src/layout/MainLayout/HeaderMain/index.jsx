import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';

import { IconPresentation, IconSettings, IconCpu, IconWorld, IconPrinter, IconRefresh, IconUser } from '@tabler/icons-react';
import usePrint from 'hooks/usePrint';
import { Button } from '@mui/material';
import useSerialNumber from 'context/SerialNumberContext';
import MobileHeader from './MobileHeader';
import { useAuth } from 'contexts/AuthContext';

const HeaderMain = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { handlePrint } = usePrint();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const { serialNumber, setSerialNumber } = useSerialNumber();
  const { logout } = useAuth();

  const username = sessionStorage.getItem('username');
  const roles = (() => {
    const stored = sessionStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  })();

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
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => { 
    if (path) {
      navigate(path);
      handleMenuClose();
    }
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    handleMenuClose();
  };

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

  const iconMenuOptions = [
    {
      icon: <IconPresentation stroke={1.5} size="1.9rem" />,
      label: t('header.measurementStatus'),
      path: '/measurement-status'
    },
    {
      icon: <IconSettings stroke={1.5} size="1.9rem" />,
      label: t('header.configuration.title'),
      options: [
        { label: t('header.configuration.instrumentConfig'), path: '/conf' },
        { label: t('header.configuration.factoryConfig'), path: '/conf-factory' },
        { label: t('header.configuration.changesSummary'), path: '/dashboard' }
      ]
    },
    {
      icon: <IconCpu stroke={1.5} size="1.9rem" />,
      label: t('header.system.title'),
      options: [
        { label: t('header.system.status'), path: '/system-status' },
        { label: t('header.system.storage'), path: '/system-storage' },
        { label: t('header.system.info'), path: '/system-info' }
      ]
    },
    {
      icon: <IconWorld stroke={1.5} size="1.9rem" />,
      label: t('header.language.title'),
      options: [
        { label: t('header.language.english'), code: 'en' },
        { label: t('header.language.german'), code: 'de' },
        { label: t('header.language.french'), code: 'fr' },
        { label: t('header.language.russian'), code: 'ru' },
      ]
    },
    {
      icon: <IconPrinter stroke={1.5} size="1.9rem" />,
      label: t('header.print'),
      onClick: handlePrint
    },
    {
      icon: <IconRefresh stroke={1.5} size="1.9rem" />,
      label: t('header.refresh'),
      onClick: handleRefresh,
    }
  ];

  if (isMobile) {
    return <MobileHeader />;
  }

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
                      } else if (option.code) {
                        handleLanguageChange(option.code);
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
        {username && roles.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconUser stroke={1.5} size="1.2rem" style={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'white', paddingRight: '60px', fontWeight: 'bold' }}>
              {username} ({roles.join(', ')})
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
          {t('header.logout')}
        </Button>
      </Box>
    </Box>
  );
};

export default HeaderMain;
