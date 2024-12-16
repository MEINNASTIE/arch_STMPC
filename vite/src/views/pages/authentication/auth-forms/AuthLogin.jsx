import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AnimateButton from 'ui-component/extended/AnimateButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CryptoJS from 'crypto-js';

const secretKey = "9rqD*1:fzOi4<</mj2Hk%*6\Yd!:£'";

// const generateHashB64 = (username, password) => {
//   const data = `${username};${password}`;
//   const hash = CryptoJS.SHA256(data); 
//   return hash.toString(CryptoJS.enc.Base64); 
// };

const generateHashB64 = async (username, password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username};${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(hashString); 
};

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
};

const AuthLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usersExist, setUsersExist] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await apiRequest('/api/users/count');
        const data = await response.json();
        setUsersExist(data.payload.count > 0);
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  const handleMouseDownPassword = (event) => event.preventDefault();
  const [userId, setUserId] = useState(null);

  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      const hashB64 = await generateHashB64(values.username, values.password);
      
      const response = await fetch(`/api/user/hash/${hashB64}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const responseData = await response.json();
  
      console.log('Full response data:', responseData);
  
      if (responseData && responseData.payload) {
        const userId = responseData.payload.userId;
        console.log('User ID from payload:', userId);  
  
        localStorage.setItem('username', responseData.payload.username);
        localStorage.setItem('rolename', responseData.payload.rolename);
        
        const tokenResponse = await fetch('/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userId }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.token) {
          const encryptedToken = CryptoJS.AES.encrypt(tokenData.token, secretKey).toString();
          localStorage.setItem('token', encryptedToken);
        } else {
          console.error('Token not found in response');
        }
  
        setUserId(userId);
        navigate('/measurement-status');
      } else {
        console.error('Response structure does not contain user data:', responseData);
        setErrors({ submit: 'Login failed: User data not found' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Invalid username or password' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleInitAdmin = async (values, { setSubmitting, setErrors }) => {
    try {
      const hashB64 = await generateHashB64(values.username, values.password);
      const response = await fetch(`/api/user/initadmin?hash=${hashB64}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {
        navigate('/main');
      }
    } catch (error) {
      setErrors({ submit: 'Error initializing admin account' });
      console.error('Admin init error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const Form = ({ isAdminInit }) => (
    <Formik
      initialValues={{ username: '', password: '', submit: null }}
      validationSchema={Yup.object().shape({
        username: Yup.string().max(255).required('Username is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={isAdminInit ? handleInitAdmin : handleLogin}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, touched, values, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Typography variant="h4" align="center">
            {isAdminInit ? 'Admin Initialization' : 'User Login'}
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

          <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={ () => setShowPassword(!showPassword) }
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {touched.password && errors.password && (
              <FormHelperText error id="standard-weight-helper-text-password">
                {errors.password}
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
              disabled={isSubmitting}
            >
              {isAdminInit ? 'Initialize Admin' : 'Login'}
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
        <Form isAdminInit={false} />
      ) : (
        <Form isAdminInit={true} />
      )}
      {userId && <Typography variant="h6">Logged in as User ID: {userId}</Typography>}
    </Box>
  );
};

export default AuthLogin;

// for sending headers to server later

// const getDecryptedToken = () => {
//   const encryptedToken = localStorage.getItem('token');
//   if (encryptedToken) {
//     const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8); // Convert back to the original token
//   }
//   return null;
// };

// const sendRequest = async () => {
//   const token = getDecryptedToken();
//   if (token) {
//     try {
//       const response = await axios.post(
//         'https://localhost/protected-route',
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log('Response:', response.data);
//     } catch (error) {
//       console.error('Request failed:', error);
//     }
//   } else {
//     console.error('No token found');
//   }
// };

