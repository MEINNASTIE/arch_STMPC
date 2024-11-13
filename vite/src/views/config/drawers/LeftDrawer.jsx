import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/system';
import { IconClockHour5 } from '@tabler/icons-react';

const LeftDrawer = ({ groups, onGroupSelect }) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 360,
          boxSizing: 'border-box',
          borderRight: '2px solid rgb(15, 29, 232)',
          height: '100vh',
          marginTop: '82px',
        },
      }}
    >
      <List style={{ marginTop: 'px', marginLeft: '45px' }}>
        <Box
          sx={{
            mt: 2,
            pl: 2,
            cursor: 'pointer',
            width: '80%',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease',
            '&:hover': {
              backgroundColor: '#3e4aec',
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption, color: 'white' }}
            display="block"
            gutterBottom
          >
            Restart
          </Typography>
        </Box>
        {groups.map((group, index) => (
          <ListItem
            button
            key={index}
            onClick={() => onGroupSelect(group)}
            sx={{
              borderRadius: `${theme.customization?.borderRadius || 8}px`,
              border: '2px solid transparent',
              transition: 'background-color 0.4s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
              mb: '8px',
              mt: 2,
              width: '80%',
            }}
          >
            <ListItemText primary={group.label} />
          </ListItem>
        ))}
        <Box sx={{ 
            mt: 2, 
            pl: 2,
            width: '80%',
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
            '&:hover': {
              backgroundColor: '#3e4aec',
            }, 
          }}>
            <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption, color: 'white', }}
            display="block"
            gutterBottom
          >
            Change Password
          </Typography>
          </Box>
          <Box sx={{ 
            mt: 2, 
            pl: 2,
            width: '80%',
            cursor: 'pointer',
            borderRadius: `${theme.customization?.borderRadius || 8}px`,
            border: '2px solid transparent',
            backgroundColor: '#87ceeb',
            transition: 'background-color 0.4s ease', 
            '&:hover': {
              backgroundColor: '#3e4aec',
            },  
          }}>
            <Typography
            variant="caption"
            sx={{ ...theme.typography.menuCaption,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
             }}
            display="block"
            gutterBottom
          >
            <IconClockHour5 stroke={1.5} size="1.9rem" />
            <p style={{margin: 0}}>Set Time</p>
          </Typography>
          </Box>
      </List>
    </Drawer>
  );
};

export default LeftDrawer;
