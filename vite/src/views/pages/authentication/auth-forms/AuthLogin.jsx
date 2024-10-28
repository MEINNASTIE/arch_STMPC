import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AnimateButton from 'ui-component/extended/AnimateButton';

const AuthLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usersExist, setUsersExist] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('https://localhost/api/users/count');
        setUsersExist(response.data.payload.count > 0);
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  const handleAuthentication = async (url, data, setErrors, setStatus) => {
    try {
      const response = await axios.post(url, data);
      if (response.status === 200 || response.status === 201) {
        const { payload } = response.data;
        if (payload && payload.token) {
          localStorage.setItem('token', payload.token);
          setStatus({ success: true });
          navigate('/main');
        } else {
          setErrors({ submit: 'Invalid response format' });
        }
      } else {
        setErrors({ submit: 'Authentication failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'An error occurred' });
    }
  };

  const handleLogin = async (values, { setErrors, setStatus }) => {
    try {
      console.log('Login form values:', values);
      const loginData = { username: values.username };

      const userResponse = await axios.get(`https://localhost/api/users`);
      const users = userResponse.data.payload;

      if (users.some(user => user.username === values.username)) {
        console.log('User found:', values.username);
        await handleAuthentication('https://localhost/login', loginData, setErrors, setStatus);
      } else {
        setErrors({ submit: 'User not found' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An error occurred during login' });
    }
  };

  const Form = () => (
    <Formik
      initialValues={{
        username: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string().max(255).required('Username is required')
      })}
      onSubmit={handleLogin}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Typography variant="h4" align="center">
            User Login
          </Typography>
          <FormControl fullWidth error={Boolean(touched.username && errors.username)} sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="outlined-adornment-username">Username</InputLabel>
            <OutlinedInput
              id="outlined-adornment-username"
              type="text"
              value={values.username}
              name="username"
              onBlur={handleBlur}
              onChange={handleChange}
              label="Username"
            />
            {touched.username && errors.username && (
              <FormHelperText error id="standard-weight-helper-text-username">
                {errors.username}
              </FormHelperText>
            )}
          </FormControl>

          <AnimateButton>
            <Button
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          </AnimateButton>
          {errors.submit && (
            <FormHelperText error>
              {errors.submit}
            </FormHelperText>
          )}
        </form>
      )}
    </Formik>
  );

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      {usersExist ? (
        <Form />
      ) : (
        <Typography align="center">No users found. Please initialize an admin.</Typography>
      )}
    </Box>
  );
};

export default AuthLogin;
