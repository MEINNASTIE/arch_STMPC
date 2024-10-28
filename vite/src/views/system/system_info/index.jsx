import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, FormControlLabel, Checkbox, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  rolename: Yup.string().required('Role name is required'),
  expDate: Yup.date().required('Expiration date is required').nullable(),
  enabled: Yup.boolean(),
});

const SystemInfo = () => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      rolename: '',
      expDate: null,
      enabled: false,
    },
    validationSchema,
    onSubmit: async (values, { setErrors, setStatus }) => {
      try {
        const createUserData = {
          username: values.username,
          password: values.password,
          rolename: values.rolename,
          expDate: values.expDate,
          enabled: values.enabled === true, 
        };

        const response = await axios.post('https://localhost/api/user', createUserData);
        if (response.status === 201) {
          setStatus({ success: true });
          console.log('User created successfully:', response.data);
          formik.resetForm();
        } else {
          setErrors({ submit: 'Failed to create user' });
        }
      } catch (error) {
        setErrors({ submit: error.response?.data?.message || 'An error occurred' });
      }
    },
  });

  return (
    <Paper elevation={3} style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>Create New User</Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Role Name"
              name="rolename"
              value={formik.values.rolename}
              onChange={formik.handleChange}
              error={formik.touched.rolename && Boolean(formik.errors.rolename)}
              helperText={formik.touched.rolename && formik.errors.rolename}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Expiration Date"
              name="expDate"
              type="date"
              value={formik.values.expDate ? formik.values.expDate.split('T')[0] : ''}
              onChange={formik.handleChange}
              error={formik.touched.expDate && Boolean(formik.errors.expDate)}
              helperText={formik.touched.expDate && formik.errors.expDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="enabled"
                  color="primary"
                  checked={formik.values.enabled}
                  onChange={formik.handleChange}
                />
              }
              label="Enabled"
            />
          </Grid>
          {formik.errors.submit && (
            <Grid item xs={12}>
              <Typography color="error">{formik.errors.submit}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button color="primary" variant="contained" fullWidth type="submit">
              Create User
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SystemInfo;
