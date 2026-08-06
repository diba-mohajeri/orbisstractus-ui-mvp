import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import orbisstractusMark from '../../../assets/orbisstractus-mark.png';
import { useAuthStore } from '../../../shared/store/authStore';
import { LOGIN_PATH } from '../../../app/paths';
import ClientBreadcrumb from './ClientBreadcrumb';
import { legacyTokens } from '../../../theme/theme';
import { ThemeProvider } from '@mui/material/styles';
import { clientPortalTheme } from '../clientPortalTheme';

const partnerNav = [
  { label: 'Home', to: '/portal', exact: true },
  { label: 'Portfolio', to: '/portal/portfolio-hub' },
  { label: 'Undergoing Assessments', to: '/portal/undergoing-assessments' },
  { label: 'Request Assessment', to: '/portal/request-assessment' },
];

export default function ClientPortalShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const clear = useAuthStore((s) => s.clear);
  function handleLogOut() { clear(); navigate(LOGIN_PATH); }

  return (
    <ThemeProvider theme={clientPortalTheme}>
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,.97)', borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)' }}>
        <Toolbar sx={{ maxWidth: 1480, width: '100%', mx: 'auto', justifyContent: 'space-between', alignItems: 'center', gap: 3, py: { xs: 1.5, md: 2 }, px: { xs: 2, md: 4 } }}>
          <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              component="img"
              src={orbisstractusMark}
              alt="Orbisstractus"
              sx={{ width: 46, height: 46, flex: '0 0 auto', borderRadius: 1.5, objectFit: 'cover' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: legacyTokens.navy, fontSize: 12, fontWeight: 900, letterSpacing: '.02em', mb: .2 }}>Orbisstractus</Typography>
              <Typography sx={{ color: legacyTokens.navy, fontSize: { xs: 18, md: 23 }, lineHeight: 1.15, fontWeight: 900 }}>Orbisstractus Partner Network</Typography>
              <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 13, mt: .45 }}>Portfolio visibility, assessment requests, deliverables, and collaboration</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: '0 0 auto' }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, px: 1.75, py: .8, borderRadius: 99, bgcolor: legacyTokens.greenSoft, color: legacyTokens.green, fontSize: 13, fontWeight: 900 }}>Client View</Box>
            <Button onClick={handleLogOut} sx={{ px: { xs: 1.5, md: 2.25 }, bgcolor: '#eef1ff', color: '#3857a6', borderRadius: 99, '&:hover': { bgcolor: '#e1e6ff' } }}>Log Out</Button>
          </Stack>
        </Toolbar>
        <Box component="nav" aria-label="Partner Network navigation" sx={{ borderTop: '1px solid', borderColor: '#edf0f4' }}>
          <Box sx={{ maxWidth: 1480, mx: 'auto', display: 'flex', gap: { xs: 0, md: 1 }, overflowX: 'auto', px: { xs: 1, md: 3 } }}>
            {partnerNav.map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return <Button key={item.label} component={Link} to={item.to} sx={{ flex: '0 0 auto', px: { xs: 1.5, md: 2 }, py: 1.5, borderRadius: 0, borderBottom: '3px solid', borderBottomColor: active ? legacyTokens.blue : 'transparent', color: active ? legacyTokens.blue : '#526074', fontSize: 13.5, fontWeight: active ? 900 : 700, '&:hover': { bgcolor: 'transparent', color: legacyTokens.blue } }}>{item.label}</Button>;
            })}
          </Box>
        </Box>
      </AppBar>
      <ClientBreadcrumb />
      <Box component="main" sx={{ width: '100%', maxWidth: 1480, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 6, '& > *': { animation: 'portalPageIn .22s ease-out' }, '@keyframes portalPageIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}><Outlet /></Box>
    </Box>
    </ThemeProvider>
  );
}
