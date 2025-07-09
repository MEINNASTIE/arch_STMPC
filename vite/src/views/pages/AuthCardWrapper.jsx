import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import MainCard from 'ui-component/cards/MainCard';

const AuthCardWrapper = ({ children, ...other }) => {

  return  (
  <MainCard
    border={true}
    sx={{
      maxWidth: { xs: 400, lg: 475 },
      margin: { xs: 2.5, md: 3 },
      '& > *': {
        flexGrow: 1,
        flexBasis: '50%'
      },
      backgroundColor: 'white'
    }}
    content={false}
    {...other}
  >
    <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
  </MainCard>
)};

AuthCardWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthCardWrapper;
