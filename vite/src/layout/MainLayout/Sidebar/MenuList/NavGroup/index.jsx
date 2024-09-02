import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

// ==============================|| SIDEBAR MENU GROUP WITHOUT LIST ||============================== //

const NavGroup = ({ item }) => {
  const theme = useTheme();

  // Render menu items
  const items = item.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <Box sx={{ mb: 1 }}>
        {/* Group Title */}
        {item.title && (
          <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} gutterBottom>
            {item.title}
            {item.caption && (
              <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} gutterBottom>
                {item.caption}
              </Typography>
            )}
          </Typography>
        )}

        {/* Menu Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items}
        </Box>
      </Box>

      {/* Group Divider */}
      <Divider sx={{ mt: 0.25, mb: 1.25 }} />
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object.isRequired
};

export default NavGroup;
