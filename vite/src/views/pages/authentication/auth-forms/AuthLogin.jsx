import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { QRCodeSVG } from 'qrcode.react';

const generateHashB64 = async (username, password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username};${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(hashString);
};

const AuthLogin = ({ ...others }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [totpUrl, setTotpUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersExist, setUsersExist] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [currentUser, setCurrentUser] = useState('');
  const [userList, setUserList] = useState([]); 
  const [newUser, setNewUser] = useState({ username: '', password: '' });

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('https://localhost/api/users/count');
        console.log('API Response:', response.data);
        setUserCount(response.data.payload.count);
        if (response.data.payload.count === 0) {
          setUsersExist(false);
          navigate('/register');
        } else {
          setUsersExist(true);
          await fetchUserList(); 
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserList = async () => {
      try {
        const response = await axios.get('https://localhost/api/users'); 
        console.log('User List:', response.data.payload);
        setUserList(response.data.payload); 
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    fetchUserCount();
  }, [navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleAddUser = async () => {
    try {
      const hashB64 = await generateHashB64(newUser.username, newUser.password);
  
      const response = await axios.post('https://localhost/api/users', {
        username: newUser.username,
        password: hashB64
      });
  
      if (response.status === 201) {
        alert('User added successfully');
        await fetchUserList(); 
      } else {
        alert('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    }
  };  

  const handleSubmit = async (values, { setErrors, setSubmitting, setStatus }) => {
    try {
      const hashB64 = await generateHashB64(values.username, values.password);

      const response = await axios.post('https://localhost/api/user/initadmin', {
        hash: hashB64
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('token', token);

        const totpResponse = await axios.get(`https://localhost/api/generate_totp?username=${values.username}`);
        setEmail(values.username);
        setTotpUrl(totpResponse.data.otp_url);
        setShowOtp(true);

        setCurrentUser(values.username);
      } else {
        setErrors({ submit: 'Failed to initialize admin' });
      }

      setStatus({ success: true });
      setSubmitting(false);
    } catch (error) {
      console.error('Login error:', error);
      setStatus({ success: false });
      setErrors({ submit: 'Invalid username or password' });
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post('https://localhost/api/verify_totp', {
        username: email,
        otp
      });
      navigate('/main');
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Typography variant="h6">User Count: {userCount}</Typography>
      {currentUser && <Typography variant="h6">Logging in as: {currentUser}</Typography>}

      {!showOtp ? (
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
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
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
                >
                  Login
                </Button>
              </AnimateButton>
            </form>
          )}
        </Formik>
      ) : (
        <Box>
          <Typography variant="h6">Enter the OTP:</Typography>
          <QRCodeSVG value={totpUrl} />
          <FormControl fullWidth>
            <OutlinedInput
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleVerifyOtp}>
            Verify OTP
          </Button>
        </Box>
      )}

      {/* User List Display */}
      <Box mt={2}>
        <Typography variant="h6">User List:</Typography>
        {userList.length > 0 ? (
          <ul>
            {userList.map(user => (
              <li key={user.userId}>
                <Typography variant="body1">{user.username} - Role: {user.rolename}</Typography>
              </li>
            ))}
          </ul>
        ) : (
          <Typography>No users found.</Typography>
        )}
      </Box>

      <Box mt={2}>
      <Typography variant="h6">Add New User</Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel htmlFor="new-username">New Username</InputLabel>
        <OutlinedInput
          id="new-username"
          type="text"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          label="New Username"
        />
      </FormControl>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel htmlFor="new-password">New Password</InputLabel>
        <OutlinedInput
          id="new-password"
          type={showPassword ? 'text' : 'password'}
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label="New Password"
        />
      </FormControl>
      <Button
        disableElevation
        fullWidth
        size="large"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleAddUser}
      >
        Add User
      </Button>
    </Box>
    </>
  );
};

export default AuthLogin;
