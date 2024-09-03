import { useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

// project imports
import { gridSpacing } from 'store/constant';

// Validation Schema for User Form
const userValidationSchema = Yup.object({
  locationName: Yup.string().required('Required'),
  saveSystemProtocol: Yup.string().required('Required'),
  saveTimeProtocol: Yup.string().required('Required'),
  MeasurementStationName: Yup.string().required('Required'),
  dhcpEnable: Yup.string().required('Required'),
  ipAddressOne: Yup.string().required('Required'),
  subNetMaskOne: Yup.string().required('Required'),
  ipAddressTwo: Yup.string().required('Required'),
  subNetMaskTwo: Yup.string().required('Required'),
  gateway: Yup.string().required('Required'),
  dnsServer: Yup.string().required('Required')
});

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const userFormik = useFormik({
    initialValues: {
      locationName: '',
      saveSystemProtocol: 'Yes',
      saveTimeProtocol: 'Yes',
      MeasurementStationName: '',
      dhcpEnable: 'Enabled',
      ipAddressOne: '',
      subNetMaskOne: '',
      ipAddressTwo: '',
      subNetMaskTwo: '',
      gateway: '',
      dnsServer: ''
    },
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      console.log('Editable Form Data', values);
    }
  });

  const paymentFormik = useFormik({
    initialValues: {
      locationName: 'LOCATION',
      saveSystemProtocol: 'Yes',
      saveTimeProtocol: 'Yes',
      MeasurementStationName: 'Spectrotracer',
      dhcpEnable: 'Enabled',
      ipAddressOne: '192.168.163.156',
      subNetMaskOne: '255.255.255.0',
      ipAddressTwo: '192.168.10.222',
      subNetMaskTwo: '255.255.255.0',
      gateway: '192.168.10.241',
      dnsServer: '0.0.0.0'
    },
    onSubmit: (values) => {
      console.log('Active Form Data', values);
    }
  });

  const handleSave = () => {
    userFormik.handleSubmit();
    paymentFormik.handleSubmit();
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Meas. Station Settings
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-start">
          <Button color="primary" variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h4" marginBottom={4} gutterBottom>
              Editable values
            </Typography>
            <form onSubmit={userFormik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Location name:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="locationName"
                    name="locationName"
                    value={userFormik.values.locationName}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.locationName && Boolean(userFormik.errors.locationName)}
                    helperText={userFormik.touched.locationName && userFormik.errors.locationName}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Save system protocol P8:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    select 
                    fullWidth
                    id="saveSystemProtocol"
                    name="saveSystemProtocol"
                    value={userFormik.values.saveSystemProtocol}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.saveSystemProtocol && Boolean(userFormik.errors.saveSystemProtocol)}
                    helperText={userFormik.touched.saveSystemProtocol && userFormik.errors.saveSystemProtocol}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Save time protocol P9:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    select
                    fullWidth
                    id="saveTimeProtocol"
                    name="saveTimeProtocol"
                    value={userFormik.values.saveTimeProtocol}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.saveTimeProtocol && Boolean(userFormik.errors.saveTimeProtocol)}
                    helperText={userFormik.touched.saveTimeProtocol && userFormik.errors.saveTimeProtocol}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Measurement station name:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="MeasurementStationName"
                    name="MeasurementStationName"
                    value={userFormik.values.MeasurementStationName}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.MeasurementStationName && Boolean(userFormik.errors.MeasurementStationName)}
                    helperText={userFormik.touched.MeasurementStationName && userFormik.errors.MeasurementStationName}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    DHCP enable:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    select
                    fullWidth
                    id="dhcpEnable"
                    name="dhcpEnable"
                    value={userFormik.values.dhcpEnable}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.dhcpEnable && Boolean(userFormik.errors.dhcpEnable)}
                    helperText={userFormik.touched.dhcpEnable && userFormik.errors.dhcpEnable}
                  >
                    <MenuItem value="Enabled">Enabled</MenuItem>
                    <MenuItem value="Disabled">Disabled</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    IP address 1:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="ipAddressOne"
                    name="ipAddressOne"
                    value={userFormik.values.ipAddressOne}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.ipAddressOne && Boolean(userFormik.errors.ipAddressOne)}
                    helperText={userFormik.touched.ipAddressOne && userFormik.errors.ipAddressOne}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Subnet mask 1:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="subNetMaskOne"
                    name="subNetMaskOne"
                    value={userFormik.values.subNetMaskOne}
                    onChange={userFormik.subNetMaskOne}
                    error={userFormik.touched.subNetMaskOne && Boolean(userFormik.errors.subNetMaskOne)}
                    helperText={userFormik.touched.subNetMaskOne && userFormik.errors.subNetMaskOne}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    IP address 2:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="ipAddressTwo"
                    name="ipAddressTwo"
                    value={userFormik.values.ipAddressTwo}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.ipAddressTwo && Boolean(userFormik.errors.ipAddressTwo)}
                    helperText={userFormik.touched.ipAddressTwo && userFormik.errors.ipAddressTwo}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Subnet mask 2:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="subNetMaskTwo"
                    name="subNetMaskTwo"
                    value={userFormik.values.subNetMaskTwo}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.subNetMaskTwo && Boolean(userFormik.errors.subNetMaskTwo)}
                    helperText={userFormik.touched.subNetMaskTwo && userFormik.errors.subNetMaskTwo}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Gateway:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="gateway"
                    name="gateway"
                    value={userFormik.values.gateway}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.gateway && Boolean(userFormik.errors.gateway)}
                    helperText={userFormik.touched.gateway && userFormik.errors.gateway}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    DNS Server:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="dnsServer"
                    name="dnsServer"
                    value={userFormik.values.dnsServer}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.dnsServer && Boolean(userFormik.errors.dnsServer)}
                    helperText={userFormik.touched.dnsServer && userFormik.errors.dnsServer}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h4" marginBottom={4} gutterBottom> 
              Active in system
            </Typography>
            <form onSubmit={paymentFormik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="locationName"
                    name="locationName"
                    value={paymentFormik.values.locationName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="saveSystemProtocol"
                    name="saveSystemProtocol"
                    value={paymentFormik.values.saveSystemProtocol}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="saveTimeProtocol"
                    name="saveTimeProtocol"
                    value={paymentFormik.values.saveTimeProtocol}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="MeasurementStationName"
                    name="MeasurementStationName"
                    value={paymentFormik.values.MeasurementStationName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="dhcpEnable"
                    name="dhcpEnable"
                    value={paymentFormik.values.dhcpEnable}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="ipAddressOne"
                    name="ipAddressOne"
                    value={paymentFormik.values.ipAddressOne}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="subNetMaskOne"
                    name="subNetMaskOne"
                    value={paymentFormik.values.subNetMaskOne}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="ipAddressTwo"
                    name="ipAddressTwo"
                    value={paymentFormik.values.ipAddressTwo}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="subNetMaskTwo"
                    name="subNetMaskTwo"
                    value={paymentFormik.values.subNetMaskTwo}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="gateway"
                    name="gateway"
                    value={paymentFormik.values.gateway}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="dnsServer"
                    name="dnsServer"
                    value={paymentFormik.values.dnsServer}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-start">
          <Button color="primary" variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
