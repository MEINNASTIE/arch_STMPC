import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { AccessAlarm, ThreeDRotation, Assignment, AttachMoney } from '@mui/icons-material'; 

const SampleComponent = ({ icon: Icon, title }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Icon style={{ marginRight: 8 }} />
    <Typography variant="subtitle1">{title}</Typography>
  </Box>
);

const SystemStatus = () => (
  <MainCard title="Another Sample Page" style={{ textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>
      Main Header
    </Typography>
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12} md={6}>
        <SampleComponent icon={AccessAlarm} title="First Component" />
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <SampleComponent icon={ThreeDRotation} title="Second Component" />
        <Typography variant="body2" gutterBottom>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <SampleComponent icon={Assignment} title="Third Component" />
        <Typography variant="body2" gutterBottom>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <SampleComponent icon={AttachMoney} title="Fourth Component" />
        <Typography variant="body2" gutterBottom>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Typography>
      </Grid>
    </Grid>
  </MainCard>
);

export default SystemStatus;
