import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { AccessAlarm, ThreeDRotation, Assignment, AttachMoney } from '@mui/icons-material'; 

const SampleComponent = ({ icon: Icon, title }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Icon style={{ marginRight: 8 }} />
    <Typography variant="subtitle1">{title}</Typography>
  </Box>
);

const SystemMemory = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('file:///home/meinna/mpcapp/_cfg/_patch/RuntimeConfigDesc_en.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => setData(jsonData))
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  if (!data) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const { payload } = data;
  const { groups } = payload;

  return (
    <MainCard title="Another Sample Page" style={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Main Header
      </Typography>
      <Grid container justifyContent="center" spacing={3}>
        {groups.map((group, groupIndex) => (
          <Grid item xs={12} md={6} key={groupIndex}>
            <Typography variant="h6">{group.label}</Typography>
            {group.pages.map((page, pageIndex) => (
              <div key={pageIndex}>
                <Typography variant="subtitle1">{page.label}</Typography>
                {page.fields.map((field, fieldIndex) => (
                  <SampleComponent 
                    key={fieldIndex} 
                    icon={AccessAlarm} 
                    title={field.label}
                  />
                ))}
              </div>
            ))}
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
};

export default SystemMemory;
