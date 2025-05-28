import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const SystemStorage = () => {
  const [chart1, setChart1] = useState(null);
  const [chart2, setChart2] = useState(null);
  const [storageData, setStorageData] = useState(null);
  const [utcTime, setUtcTime] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const calculateTimeBasedMetric = (count, startTime, type) => {
    switch(type) {
      case 'files':
      case 'records':
        return (count / 1440 / 7).toFixed(2);
      case 'transactions':
        return (count / 1440).toFixed(2);
      case 'bytes':
        return (count / 15000 / 1440).toFixed(2);
      default:
        return '0.00';
    }
  };

  const formatBytes = (bytes) => {
    return bytes.toLocaleString('en-US');
  };

  useEffect(() => {
    const chart1Instance = echarts.init(document.getElementById('chart1'));
    const chart2Instance = echarts.init(document.getElementById('chart2'));
    setChart1(chart1Instance);
    setChart2(chart2Instance);

    const handleResize = () => {
      chart1Instance?.resize();
      chart2Instance?.resize();
    };

    window.addEventListener('resize', handleResize);

    const fetchData = async () => {
      try {
        const response = await fetch('/api/meas/storage/files/stats');
        const data = await response.json();
        setStorageData(data.payload);
        setUtcTime(data.nowUTC);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart1Instance.dispose();
      chart2Instance.dispose();
    };
  }, []);

  useEffect(() => {
    if (!storageData || !chart1 || !chart2) return;

    const totalMB = storageData.DiskDB_totalMB;
    const freeMB = storageData.DiskDB_freeMB;
    const usedMB = totalMB - freeMB;
    const dbTotalMB = storageData.DB_totalMB;
    const usedByFilesMB = totalMB - dbTotalMB - freeMB;

    const getChartOptions = (isMobile, isTablet) => ({
      title: {
        text: `Disk DB Usage. Total: ${formatNumber(totalMB)} MB`,
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 12 : isTablet ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}: ${formatNumber(params.value)} MB (${params.percent}%)`;
        }
      },
      series: [
        {
          name: 'Disk Usage',
          type: 'pie',
          radius: isMobile ? ['50%', '70%'] : isTablet ? ['55%', '75%'] : ['60%', '80%'],
          label: {
            show: true,
            position: 'outside',
            formatter: (params) => `${params.name}: ${formatNumber(params.value)} MB`,
            fontSize: isMobile ? 10 : isTablet ? 12 : 14
          },
          data: [
            { value: usedMB, name: 'Used Disk Space', itemStyle: { color: 'orange' } },
            { value: freeMB, name: 'Free Disk Space', itemStyle: { color: 'blue' } }
          ]
        },
        {
          name: 'Database Usage',
          type: 'pie',
          radius: isMobile ? ['20%', '40%'] : isTablet ? ['25%', '45%'] : ['30%', '50%'],
          label: {
            show: true,
            position: 'outside',
            formatter: (params) => `${params.name}: ${formatNumber(params.value)} MB`,
            fontSize: isMobile ? 10 : isTablet ? 12 : 14
          },
          data: [
            { value: dbTotalMB, name: `Database Total (${formatNumber(storageData.no_of_recs)} recs.)`, itemStyle: { color: '#FFA726' } },
            { value: usedByFilesMB, name: 'Used by Files', itemStyle: { color: '#FB8C00' } }
          ]
        }
      ]
    });

    const getChart2Options = (isMobile, isTablet) => ({
      title: {
        text: `Disk Mfiles Usage. Total: ${formatNumber(storageData.DiskMFiles_totalMB)} MB`,
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 12 : isTablet ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}: ${formatNumber(params.value)} MB (${params.percent}%)`;
        }
      },
      series: [
        {
          name: 'Disk Usage',
          type: 'pie',
          radius: isMobile ? ['50%', '70%'] : isTablet ? ['55%', '75%'] : ['60%', '80%'],
          label: {
            show: true,
            position: 'outside',
            formatter: (params) => `${params.name}: ${formatNumber(params.value)} MB`,
            fontSize: isMobile ? 10 : isTablet ? 12 : 14
          },
          data: [
            { value: storageData.DiskDB_totalMB - storageData.DiskDB_freeMB, name: 'Used Disk Space', itemStyle: { color: 'orange' } },
            { value: storageData.DiskDB_freeMB, name: 'Free Disk Space', itemStyle: { color: 'blue' } }
          ]
        }
      ]
    });

    chart1.setOption(getChartOptions(isMobile, isTablet));
    chart2.setOption(getChart2Options(isMobile, isTablet));
  }, [storageData, chart1, chart2, isMobile, isTablet]);

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
      <Box sx={{ py: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: {
              xs: '1rem',
              sm: '1rem',
              md: '1rem'
            }
          }}
        >
          Disk Storage Statistics {utcTime && `(UTC: ${utcTime})`}
        </Typography>
        
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: { xs: 1, sm: 2 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                 border: 1, borderColor: 'divider'
              }}
            >
              <div id="chart1" style={{ width: '100%', height: isMobile ? '300px' : isTablet ? '350px' : '400px' }}></div>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: { xs: 1, sm: 2 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                 border: 1, borderColor: 'divider'
              }}
            >
              <div id="chart2" style={{ width: '100%', height: isMobile ? '300px' : isTablet ? '350px' : '400px' }}></div>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 1, sm: 2 },  border: 1, borderColor: 'divider'}}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                StatsIO Information
              </Typography>
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Last Time</TableCell>
                      <TableCell>Number of Files</TableCell>
                      <TableCell>Number of Records</TableCell>
                      <TableCell>Number of Transactions</TableCell>
                      <TableCell>Total Bytes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storageData?.StatsIO && (
                      <TableRow>
                        <TableCell>{storageData.StatsIO.Name}</TableCell>
                        <TableCell>{new Date(storageData.StatsIO.LastTime).toLocaleString()}</TableCell>
                        <TableCell>
                          {storageData.StatsIO.NoOfFiles.toLocaleString()}
                          <Typography variant="caption" display="block" color="text.secondary">
                            ({calculateTimeBasedMetric(storageData.StatsIO.NoOfFiles, storageData.StatsIO.LastTime, 'files')} days in 1 min cycle)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {storageData.StatsIO.NoOfRecs.toLocaleString()}
                          <Typography variant="caption" display="block" color="text.secondary">
                            ({calculateTimeBasedMetric(storageData.StatsIO.NoOfRecs, storageData.StatsIO.LastTime, 'records')} days in 1 min cycle)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {storageData.StatsIO.NoOfTrn.toLocaleString()}
                          <Typography variant="caption" display="block" color="text.secondary">
                            ({calculateTimeBasedMetric(storageData.StatsIO.NoOfTrn, storageData.StatsIO.LastTime, 'transactions')} days in 1 min cycle)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatBytes(storageData.StatsIO.NoOfBytes)}
                          <Typography variant="caption" display="block" color="text.secondary">
                            ({calculateTimeBasedMetric(storageData.StatsIO.NoOfBytes, storageData.StatsIO.LastTime, 'bytes')} days in 1 min cycle)
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 1, sm: 2 },  border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                SD Stats Since Last Boot
              </Typography>
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bytes Read</TableCell>
                      <TableCell>Bytes Written</TableCell>
                      <TableCell>Difference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storageData?.SDinfo && (
                      <TableRow>
                        <TableCell>{formatBytes(storageData.SDinfo.bytesReadSinceBoot)}</TableCell>
                        <TableCell>{formatBytes(storageData.SDinfo.bytesWrittenSinceBoot)}</TableCell>
                        <TableCell>
                          (+ 0) in 0d 0h 0m 0s
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, border: 1, borderColor: 'divider'}}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Storage Limits
              </Typography>
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Days to Keep</TableCell>
                      <TableCell>Records to Keep</TableCell>
                      <TableCell>DB Max Size (MB)</TableCell>
                      <TableCell>DB Min Free Space (MB)</TableCell>
                      <TableCell>Files Min Free Space (MB)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storageData?.StorageLimits && (
                      <TableRow>
                        <TableCell>{storageData.StorageLimits.NoOfDaysToKeep}</TableCell>
                        <TableCell>{storageData.StorageLimits.NoOfRecsToKeep.toLocaleString()}</TableCell>
                        <TableCell>{storageData.StorageLimits.DBmaxSizeMB}</TableCell>
                        <TableCell>{storageData.StorageLimits.DBminFreeSpaceMB}</TableCell>
                        <TableCell>{storageData.StorageLimits.FILESminFreeSpaceMB}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SystemStorage;
