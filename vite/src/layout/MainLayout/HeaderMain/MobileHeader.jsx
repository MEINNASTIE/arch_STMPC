import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/List';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';

import { IconPresentation, IconSettings, IconCpu, IconWorld, IconPrinter, IconRefresh, IconUser } from '@tabler/icons-react';
import usePrint from 'hooks/usePrint';
import useSerialNumber from 'context/SerialNumberContext';
import { useAuth } from 'contexts/AuthContext';

const MobileHeader = () => {
  const navigate = useNavigate();
  const { handlePrint } = usePrint();
  const [menuOpen, setMenuOpen] = useState(false);
  const { serialNumber } = useSerialNumber();
  const { logout } = useAuth();

  const username = sessionStorage.getItem('username');
  const roles = (() => {
    const stored = sessionStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  })();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const menuItems = [
    {
      icon: <IconPresentation stroke={1.5} size="1.2rem" />,
      label: 'Measurement status',
      path: '/measurement-status'
    },
    {
      icon: <IconSettings stroke={1.5} size="1.2rem" />,
      label: 'Configuration',
      subItems: [
        { label: 'Instrument configuration', path: '/conf' },
        { label: 'Factory configuration', path: '/conf-factory' },
        { label: 'Summary of changes', path: '/dashboard' }
      ]
    },
    {
      icon: <IconCpu stroke={1.5} size="1.2rem" />,
      label: 'System',
      subItems: [
        { label: 'System status', path: '/system-status' },
        { label: 'Storage', path: '/system-storage' },
        { label: 'System info', path: '/system-info' }
      ]
    },
    {
      icon: <IconWorld stroke={1.5} size="1.2rem" />,
      label: 'Language',
      subItems: [
        { label: 'English' },
        { label: 'German' },
        { label: 'French' },
        { label: 'Russian' },
      ]
    },
    {
      icon: <IconPrinter stroke={1.5} size="1.2rem" />,
      label: 'Print',
      onClick: handlePrint
    },
    {
      icon: <IconRefresh stroke={1.5} size="1.2rem" />,
      label: 'Refresh',
      onClick: handleRefresh
    }
  ];

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setMenuOpen(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#3e4aec',
        borderRadius: '8px',
        marginTop: '1px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '6px 12px',
      }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          SpectroTRACER {serialNumber || ''}
        </Typography>
        <IconButton
          sx={{ 
            color: 'white',
            transform: menuOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s ease-in-out'
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {username && roles.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pb: 0.5 }}>
          <IconUser stroke={1.5} size="1rem" style={{ color: '#3e4aec' }} />
          <Typography variant="body2" sx={{ color: '#3e4aec', fontWeight: 'medium' }}>
            {username} ({roles.join(', ')})
          </Typography>
        </Box>
      )}

      <Collapse in={menuOpen}>
        <Box sx={{ 
          backgroundColor: 'white',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          padding: "20px"
        }}>
          <List sx={{ py: 0, cursor: 'pointer' }}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  button
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                      setMenuOpen(false);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: 'rgba(62, 74, 236, 0.05)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    <Typography 
                      sx={{ 
                        color: 'black',
                        fontSize: '0.9rem',
                        fontWeight: 'medium'
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </ListItem>
                {item.subItems?.map((subItem, subIndex) => (
                  <ListItem
                    key={subIndex}
                    button
                    sx={{ 
                      pl: 4,
                      py: 0.5,
                      backgroundColor: 'rgba(62, 74, 236, 0.02)',
                      '&:hover': {
                        backgroundColor: 'rgba(62, 74, 236, 0.05)',
                      }
                    }}
                    onClick={() => {
                      if (subItem.path) {
                        handleNavigation(subItem.path);
                      } else {
                        console.log('Change language to', subItem.label);
                        setMenuOpen(false);
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: '#3e4aec',
                        fontSize: '0.85rem'
                      }}
                    >
                      {subItem.label}
                    </Typography>
                  </ListItem>
                ))}
                {index < menuItems.length - 1 && <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.1)' }} />}
              </React.Fragment>
            ))}
            <ListItem sx={{ px: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleLogout}
                sx={{ 
                  mt: 1,
                  mb: 1,
                  color: '#3e4aec',
                  borderColor: '#3e4aec',
                  '&:hover': {
                    borderColor: '#3e4aec',
                    backgroundColor: 'rgba(62, 74, 236, 0.05)',
                  }
                }}
              >
                Log Out
              </Button>
            </ListItem>
          </List>
        </Box>
      </Collapse>
    </Box>
  );
};

export default MobileHeader; 