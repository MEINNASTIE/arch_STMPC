// material-ui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER ||============================== //

const AuthFooter = () => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="subtitle2" component={Link} href="https://www.bertin-technologies.com" target="_blank" underline="hover">
      Bertin Technologies 2024
    </Typography>
  </Stack>
);

export default AuthFooter;
