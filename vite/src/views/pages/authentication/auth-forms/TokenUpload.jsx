import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useAuth } from 'contexts/AuthContext';
import CryptoJS from 'crypto-js';

const generateHashB64 = async (username, password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username};${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
};

const generateTokenHashB64 = async (tokenString) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(tokenString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const uint8Array = new Uint8Array(hashBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

const secretKey = "9rqD*1:fzOi4<</mj2Hk%*6\Yd!:£'";

const TokenUpload = ({ username }) => {
  if (username !== 'bertin' && username !== 'service') {
    return <Typography color="error">Token upload is only allowed for bertin or admin users.</Typography>;
  }
  const theme = useTheme();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { login } = useAuth();

  const handleTokenUpload = async (values, { setSubmitting, setErrors }) => {
    try {
      if (!values.tokenfile) {
        setErrors({ submit: 'Token file is required' });
        setSubmitting(false);
        return;
      }
      const fileText = await values.tokenfile.text();
      const token = fileText.trim();
      console.log('Username:', username);
      console.log('Token:', token);
      const response = await fetch('/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token }),
        credentials: 'include',
      });
      const respJson = await response.json();
      if (!response.ok) {
        setErrors({ submit: `Token does not match this user. Server response: ${JSON.stringify(respJson)}` });
        setSubmitting(false);
        return;
      }
      const encryptedToken = CryptoJS.AES.encrypt(respJson.token, secretKey).toString();
      login(encryptedToken, username, respJson.roles || []);
      setUploadSuccess(true);
      setTimeout(() => window.location.href = '/measurement-status', 1000);
    } catch (error) {
      setErrors({ submit: 'Error uploading token' });
      console.error('Token upload error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ tokenfile: null, submit: null }}
      validationSchema={Yup.object().shape({
        tokenfile: Yup.mixed().required('Token file is required')
      })}
      onSubmit={handleTokenUpload}
    >
      {({ errors, setFieldValue, handleSubmit, touched, isSubmitting, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Typography variant="h4" align="center">
            Upload Token for user {username}
          </Typography>
          <FormControl fullWidth error={Boolean(touched.tokenfile && errors.tokenfile)} sx={{ ...theme.typography.customInput, mt: 3 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Choose Token File
              <input
                type="file"
                hidden
                accept="*"
                onChange={event => {
                  setFieldValue('tokenfile', event.currentTarget.files[0]);
                }}
              />
            </Button>
            {touched.tokenfile && errors.tokenfile && (
              <FormHelperText error id="standard-weight-helper-text-tokenfile">
                {errors.tokenfile}
              </FormHelperText>
            )}
          </FormControl>
          {values.tokenfile && (
            <AnimateButton>
              <Button
                disableElevation
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 4 }}
              >
                Upload and Continue
              </Button>
            </AnimateButton>
          )}
          {errors.submit && (
            <FormHelperText error>
              {errors.submit}
            </FormHelperText>
          )}
          {uploadSuccess && (
            <FormHelperText sx={{ color: 'success.main' }}>
              Token uploaded successfully! Redirecting...
            </FormHelperText>
          )}
        </form>
      )}
    </Formik>
  );
};

export default TokenUpload; 