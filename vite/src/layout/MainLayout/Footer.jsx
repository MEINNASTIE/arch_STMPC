import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import LogoSection from './LogoSection';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 1, sm: 1.5 },
        px: { xs: 2, sm: 4 },
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: '#3e4aec',
        borderRadius: { xs: '0', sm: '8px' },
        margin: { xs: '0', sm: '0 30px' },
        marginBottom: { xs: '0', sm: '2px' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%',
          mx: 'auto',
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            ml: { xs: 0, sm: 4 },
            color: 'white',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Bertin Technologies
        </Typography>
        <Box sx={{ mt: { xs: 1, sm: 0 } }}>
          <LogoSection />
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            mr: { xs: 0, sm: 4 },
            color: 'white',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Spectrotracer v0.1.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer; 