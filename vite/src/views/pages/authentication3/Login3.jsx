import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthLogin from '../authentication/auth-forms/AuthLogin';
import AdminInit from '../authentication/auth-forms/AdminInit';
import TokenUpload from '../authentication/auth-forms/TokenUpload';
import { useState, useEffect } from 'react';

const Login = () => {
  const [usersExist, setUsersExist] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mpcSN, setMpcSN] = useState('');
  const [showTokenUpload, setShowTokenUpload] = useState(false);
  const [tokenUploadUsername, setTokenUploadUsername] = useState('');

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/users/count');
        const data = await response.json();
        setUsersExist(data.payload.count > 0);
        setMpcSN(data.mpcSN || '');
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserCount();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <AuthWrapper1>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ flexGrow: 1 }}
        >
          <Grid item>
            <AuthCardWrapper adminInit={!usersExist} tokenUploadBorder={showTokenUpload}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item sx={{ mb: 3 }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    align="center"
                  >
                    {mpcSN || 'SpectroTRACER'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction={{ xs: 'column-reverse', md: 'row' }} alignItems="center" justifyContent="center">
                    <Grid item>
                      <Stack alignItems="center" justifyContent="center" spacing={1}>
                        {!(showTokenUpload) && (
                          <Typography variant="caption" fontSize="16px" textAlign={{ xs: 'center', md: 'inherit' }}>
                            {usersExist
                              ? 'Enter your credentials to continue'
                              : 'This is your first login. Please set the administrator password.'}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  {showTokenUpload && (tokenUploadUsername === 'bertin' || tokenUploadUsername === 'service') ? (
                    <>
                      <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                        Please upload the token file provided by the manufacturer
                      </Typography>
                      <TokenUpload username={tokenUploadUsername} />
                    </>
                  ) : usersExist ? (
                    <AuthLogin onEmptyPassword={(username) => {
                      setTokenUploadUsername(username);
                      setShowTokenUpload(true);
                    }} />
                  ) : (
                    <AdminInit />
                  )}
                </Grid>
              </Grid>
            </AuthCardWrapper>
          </Grid>
        </Grid>
      </Box>
    </AuthWrapper1>
  );
};

export default Login;
