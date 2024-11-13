import React from 'react';
import { Drawer, Box, Button } from '@mui/material';
import { useTheme } from '@mui/system';

const RightDrawer = () => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: 80,
        flexShrink: 0,
        zIndex: 0,
        '& .MuiDrawer-paper': {
          width: 360,
          boxSizing: 'border-box',
          borderLeft: '2px solid rgb(15, 29, 232)',
          height: '100vh',
          marginTop: '82px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: -1,
        },
      }}
    >
      <Button
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          padding: '10px',
          width: '40%',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
          borderRadius: `${theme.customization?.borderRadius || 8}px`,
          backgroundColor: '#87ceeb',
          transition: 'background-color 0.4s ease',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#3e4aec')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#87ceeb')}
      >
        Apply
      </Button>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '100px'}}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '80px',
            }}
          >
            Some content
          </Box>
        </div>
    </Drawer>
  );
};

export default RightDrawer;
