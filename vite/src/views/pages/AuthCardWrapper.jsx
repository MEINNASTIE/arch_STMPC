import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import MainCard from 'ui-component/cards/MainCard';

const AuthCardWrapper = ({ children, adminInit = false, tokenUploadBorder = false, ...other }) => {

  return  (
    <MainCard
      sx={{
        maxWidth: { xs: 400, lg: 475 },
        margin: { xs: 2.5, md: 3 },
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%'
        },
        backgroundColor: 'white',
        border: '2px solid',
        borderColor: tokenUploadBorder ? '#43a047' : adminInit ? '#ffd700' : 'primary.main',
      }}
      content={false}
      {...other}
    >
      <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
    </MainCard>
  )
};

AuthCardWrapper.propTypes = {
  children: PropTypes.node,
  adminInit: PropTypes.bool,
  tokenUploadBorder: PropTypes.bool
};

export default AuthCardWrapper;
