import { Grid, Typography, Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Plot from 'react-plotly.js';

const MeasurementPage = () => {
  return (
    <MainCard title="Measurement Status SpectroTRACER">
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6">Sidebar where more info and table will go</Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis ligula ac urna feugiat aliquam.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={9}>
          <Box>
            <Plot
              data={[
                {
                  x: ['CT1-CalibNet', 'CT2-CalibNet', 'CT3-CalibNet', 'CT24-CalibNet'],
                  y: [20, 35, 25, 40],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'blue' },
                  name: 'Spectrum A'
                },
                {
                  x: ['CT1-CalibNet', 'CT2-CalibNet', 'CT3-CalibNet', 'CT24-CalibNet'],
                  y: [15, 30, 22, 37],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'green' },
                  name: 'Spectrum B'
                },
                {
                  x: ['CT1-CalibNet', 'CT2-CalibNet', 'CT3-CalibNet', 'CT24-CalibNet'],
                  y: [25, 40, 30, 45],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'red' },
                  name: 'Spectrum C'
                }
              ]}
              layout={{
                title: 'Spectra Analysis at 11/11/2024 13:40:00',
                xaxis: {
                  title: 'Calibration Type',
                  tickangle: -45
                },
                yaxis: {
                  title: 'Intensity (a.u.)',
                  range: [0, 50]
                },
                legend: {
                  x: 1,
                  y: 1
                }
              }}
            />
          </Box>

          <Box mt={2}>
            <Typography variant="h6">Information Section</Typography>
            <Typography variant="body2">
              Detailed information about the measurement process, equipment calibration, and interpretation of the results goes here.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default MeasurementPage;
