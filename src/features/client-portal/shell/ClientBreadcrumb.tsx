import { Box, Link as MuiLink, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CLIENT_NAV_ITEMS } from '../navItems';

export default function ClientBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const relative = location.pathname.replace(/^\/portal\/?/, '');
  const current = CLIENT_NAV_ITEMS.find((item) => item.path === relative) ?? CLIENT_NAV_ITEMS[0];
  const isHome = current.key === 'choice';

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 1.35, bgcolor: '#f6f8fb', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
        {isHome ? (
          <Typography variant="body2" sx={{ color: '#172b4d', fontWeight: 800 }}>Partner Network · Home</Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="button" type="button" aria-label="Back" onClick={() => navigate(-1)} sx={{ display: 'inline-flex', alignItems: 'center', gap: .75, border: '1px solid', borderColor: 'divider', bgcolor: '#fff', color: 'text.primary', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, borderRadius: 2.5, px: 1.5, py: .75, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
              <ArrowBackIcon fontSize="inherit" /> Back
            </Box>
            <Typography variant="body2" color="text.secondary">
              <MuiLink component={Link} to="/portal" underline="hover" color="inherit">Partner Network</MuiLink>
              {' › '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>{current.label}</Box>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
