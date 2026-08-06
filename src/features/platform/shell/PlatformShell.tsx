import { AppBar, Box, Button, Chip, Stack, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import orbisstractusMark from '../../../assets/orbisstractus-mark.png';
import { useAuthStore } from '../../../shared/store/authStore';
import { LOGIN_PATH } from '../../../app/paths';
import { legacyTokens } from '../../../theme/theme';
import { PLATFORM_NAV_ITEMS } from '../navItems';

export default function PlatformShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const clear = useAuthStore((s) => s.clear);
  const session = useAuthStore((s) => s.session);

  function handleLogOut() {
    clear();
    navigate(LOGIN_PATH);
  }

  const currentScreenKey =
    PLATFORM_NAV_ITEMS.find((item) => {
      if (!item.path) return location.pathname === '/platform';
      const to = `/platform/${item.path}`;
      return location.pathname === to || location.pathname.startsWith(`${to}/`);
    })?.key ?? 'overview';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Box
              component="img"
              src={orbisstractusMark}
              alt="Orbisstractus"
              sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: 'cover' }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Orbisstractus Platform Console
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vendor-level oversight across every company running on Orbisstractus.
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              label={`Signed in as: ${session?.user.email ?? 'unknown'} (Platform Admin)`}
              size="small"
              sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, fontWeight: 800 }}
            />
            <Button variant="outlined" onClick={() => navigate('/insightx')}>
              Open InsightX
            </Button>
            <Button variant="outlined" onClick={handleLogOut}>
              Log Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box
          component="nav"
          sx={{ width: { xs: '100%', md: 260 }, bgcolor: legacyTokens.navy, color: '#fff', p: 2, flexShrink: 0 }}
        >
          <Box
            sx={{
              border: '1px solid rgba(255,255,255,.14)',
              bgcolor: 'rgba(255,255,255,.08)',
              borderRadius: 3,
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: '#d6e2ef', display: 'block' }}>
              Orbisstractus
            </Typography>
            <Typography sx={{ fontWeight: 900 }}>Platform Vendor Console</Typography>
            <Typography variant="caption" sx={{ color: '#d6e2ef', display: 'block', mt: 1 }}>
              Not scoped to a single company — this account sees every tenant.
            </Typography>
          </Box>

          <Stack spacing={0.5}>
            {PLATFORM_NAV_ITEMS.map((item) => {
              const to = item.path ? `/platform/${item.path}` : '/platform';
              const isActive = item.key === currentScreenKey;
              return (
                <Box
                  key={item.key}
                  component={Link}
                  to={to}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : '#dce8f6',
                    bgcolor: isActive ? 'rgba(255,255,255,.13)' : 'transparent',
                    borderRadius: 3,
                    p: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,.13)', color: '#fff' },
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{item.label}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box component="main" sx={{ flex: 1, p: 3, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
