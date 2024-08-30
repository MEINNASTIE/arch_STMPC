import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// QR Code library
import { QRCodeSVG } from 'qrcode.react';

const AuthLogin = ({ ...others }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [totpUrl, setTotpUrl] = useState('');

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (values, { setErrors, setSubmitting, setStatus }) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username: values.username,
        password: values.password
      });
      localStorage.setItem('token', response.data.token);

      const totpResponse = await axios.get(`http://127.0.0.1:5000/generate_totp?username=${values.username}`);
      setEmail(values.username);
      setTotpUrl(totpResponse.data.otp_url); 
      setShowOtp(true);

      setStatus({ success: true });
      setSubmitting(false);
    } catch (error) {
      setStatus({ success: false });
      setErrors({ submit: 'Invalid username or password' });
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/verify_totp', {
        username: email,
        otp
      });
      navigate('/');
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign in with username</Typography>
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={{
          username: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string().max(255).required('Username is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.username && errors.username)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-username-login">Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-username-login"
                type="text"
                value={values.username}
                name="username"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Username"
                inputProps={{}}
              />
              {touched.username && errors.username && (
                <FormHelperText error id="standard-weight-helper-text-username-login">
                  {errors.username}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="secondary">
                  Log in
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>

      {showOtp && (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel htmlFor="otp">Enter OTP</InputLabel>
            <OutlinedInput
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              label="OTP"
            />
            <FormHelperText id="otp-helper-text">Enter the OTP sent to your application</FormHelperText>
          </FormControl>
          <Button disableElevation onClick={handleVerifyOtp} variant="contained" color="secondary" fullWidth size="large">
            Verify OTP
          </Button>

          {totpUrl && (
            <Grid container justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="subtitle1" gutterBottom>
                Scan the QR code with your authenticator app:
              </Typography>
              <Box sx={{ mt: 2 }}>
                <QRCodeSVG value={totpUrl} size={150} />
              </Box>
            </Box>
          </Grid>
          )}
        </Box>
      )}
    </>
  );
};

export default AuthLogin;
