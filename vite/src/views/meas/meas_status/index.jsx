import { Grid, Typography, Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Plot from 'react-plotly.js'; 

const MeasurementPage = () => {
  return (
    <MainCard title="Dashboard">
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6">Sidebar</Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis ligula ac urna feugiat aliquam.
            </Typography>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={9}>
          <Box>
            {/* Plotly Chart */}
            <Typography variant="h6">Plotly Chart</Typography>
            <Plot
              data={[
                {
                  x: [1, 2, 3, 4],
                  y: [10, 15, 13, 17],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'red' }
                }
              ]}
              layout={{ title: 'Sample Chart' }}
            />
          </Box>

          {/* Section Below */}
          <Box mt={2}>
            <Typography variant="h6">Information Section</Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus euismod, orci ac interdum elementum, enim justo cursus
              odio, sed pulvinar lorem metus sit amet felis.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default MeasurementPage;
