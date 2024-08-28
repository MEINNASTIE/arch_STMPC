import { useState } from 'react';
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

// project imports
import { gridSpacing } from 'store/constant';

// Validation Schema for User Form
const userValidationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required')
});

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  // User Formik
  const userFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: ''
    },
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      console.log('User Form Data', values);
    }
  });

  // Payment Formik (Read-only form)
  const paymentFormik = useFormik({
    initialValues: {
      cardNumber: 'LOCATION',
      expirationDate: 'Yes',
      cvv: 'Yes'
    },
    onSubmit: (values) => {
      console.log('Payment Form Data', values);
    }
  });

  const handleSave = () => {
    userFormik.handleSubmit();
    paymentFormik.handleSubmit();
  };

  return (
    <Grid container spacing={gridSpacing}>
      {/* Heading */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Meas. Station Settings
        </Typography>
      </Grid>
      {/* Top Save Button */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-start">
          <Button color="primary" variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Grid>

      {/* User Form */}
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
                    id="firstName"
                    name="firstName"
                    value={userFormik.values.firstName}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.firstName && Boolean(userFormik.errors.firstName)}
                    helperText={userFormik.touched.firstName && userFormik.errors.firstName}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Save system protocol P8:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    value={userFormik.values.lastName}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.lastName && Boolean(userFormik.errors.lastName)}
                    helperText={userFormik.touched.lastName && userFormik.errors.lastName}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" align="right">
                    Save time protocol P9: 
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    value={userFormik.values.email}
                    onChange={userFormik.handleChange}
                    error={userFormik.touched.email && Boolean(userFormik.errors.email)}
                    helperText={userFormik.touched.email && userFormik.errors.email}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Form (Read-Only) */}
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
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentFormik.values.cardNumber}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="expirationDate"
                    name="expirationDate"
                    value={paymentFormik.values.expirationDate}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    id="cvv"
                    name="cvv"
                    value={paymentFormik.values.cvv}
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

      {/* Bottom Save Button */}
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
