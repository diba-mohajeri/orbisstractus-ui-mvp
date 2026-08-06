import { AppBar, Box, Button, Chip, MenuItem, Stack, TextField, Toolbar, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import orbisstractusMark from '../../../assets/orbisstractus-mark.png';
import { useAuthStore } from '../../../shared/store/authStore';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { LOGIN_PATH } from '../../../app/paths';
import { legacyTokens } from '../../../theme/theme';
import { useProjects } from '../../client-portal/api';
import { useCompanies } from '../../platform/api';
import { EMPLOYEE_ROLE_OPTIONS } from '../../../domain/auth';
import { PROJECT_STEP_KEYS, type ProjectStepKey } from '../../../domain/projectAccess';
import { INSIGHTX_NAV_ITEMS } from '../navItems';
import { useMyProjectAccess } from '../shared/useMyProjectAccess';
import TechnicalLayerDrawer from './TechnicalLayerDrawer';
import QaCheckOverlay from './QaCheckOverlay';

const PROJECT_STEP_KEY_SET = new Set<string>(PROJECT_STEP_KEYS);

const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));

export default function InsightXShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const clear = useAuthStore((s) => s.clear);
  const session = useAuthStore((s) => s.session);
  const role = session?.user.role;
  const visibleNavItems = INSIGHTX_NAV_ITEMS.filter(
    (item) => item.key !== 'admin' || role === 'admin' || role === 'platformAdmin',
  );

  const { data: projects } = useProjects();
  const { data: companies } = useCompanies();
  const companyName = companies?.find((c) => c.id === session?.user.companyId)?.name;
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const setCurrentProjectId = useInsightXShellStore((s) => s.setCurrentProjectId);
  const technicalDrawerOpen = useInsightXShellStore((s) => s.technicalDrawerOpen);
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const closeTechnicalDrawer = useInsightXShellStore((s) => s.closeTechnicalDrawer);
  const qaCheckOpen = useInsightXShellStore((s) => s.qaCheckOpen);
  const openQaCheck = useInsightXShellStore((s) => s.openQaCheck);
  const closeQaCheck = useInsightXShellStore((s) => s.closeQaCheck);

  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  const { data: myAccess } = useMyProjectAccess(currentProject?.id);

  function handleLogOut() {
    clear();
    navigate(LOGIN_PATH);
  }

  const currentScreenKey =
    INSIGHTX_NAV_ITEMS.find((item) => {
      if (!item.path) return location.pathname === '/insightx';
      const to = `/insightx/${item.path}`;
      return location.pathname === to || location.pathname.startsWith(`${to}/`);
    })?.key ?? 'overview';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          // Technical-layer panels start below the global controls; the controls remain undimmed and interactive.
          zIndex: theme.zIndex.drawer + 1,
        })}
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
                Orbisstractus | InsightX
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orbisstractus-powered assessment execution — delivered through the Partner Network
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              label={`Signed in as: ${session?.user.email ?? 'unknown'} (${role ? ROLE_LABEL.get(role) ?? role : 'no role'})`}
              size="small"
              sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, fontWeight: 800 }}
            />
            {companyName && (
              <Chip
                label={companyName}
                size="small"
                sx={{ bgcolor: legacyTokens.navy, color: '#fff', fontWeight: 800 }}
              />
            )}
            <Chip
              label="Executive Mode"
              size="small"
              sx={{ bgcolor: legacyTokens.greenSoft, color: legacyTokens.green, fontWeight: 800 }}
            />
            <Button variant="outlined" onClick={openTechnicalDrawer}>
              Technical Layer
            </Button>
            <Button variant="contained" color="success" onClick={openQaCheck}>
              Run QA Check
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
            <Typography variant="caption" sx={{ color: '#d6e2ef', display: 'block', mb: 1 }}>
              Current Project
            </Typography>
            {activeProjects.length > 0 ? (
              <TextField
                select
                size="small"
                fullWidth
                value={currentProject?.id ?? ''}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: '#fff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.3)' },
                  '& .MuiSvgIcon-root': { color: '#fff' },
                }}
              >
                {activeProjects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.buildingName}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Loading…
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#d6e2ef', display: 'block', mt: 1 }}>
              Powered by Orbisstractus · InsightX
            </Typography>
          </Box>

          <Stack spacing={0.5}>
            {visibleNavItems.map((item) => {
              const to = item.path ? `/insightx/${item.path}` : '/insightx';
              const isActive = item.key === currentScreenKey;
              const isLocked = PROJECT_STEP_KEY_SET.has(item.key) && myAccess?.[item.key as ProjectStepKey] === 'none';
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
                    opacity: isLocked ? 0.55 : 1,
                    '&:hover': { bgcolor: 'rgba(255,255,255,.13)', color: '#fff' },
                  }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{item.label}</Typography>
                    {isLocked && (
                      <LockOutlinedIcon sx={{ fontSize: 14 }} titleAccess="No access to this step on the current project" />
                    )}
                  </Stack>
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

      <TechnicalLayerDrawer
        open={technicalDrawerOpen}
        onClose={closeTechnicalDrawer}
        screenKey={currentScreenKey}
        buildingId={currentProject?.buildingId ?? null}
      />
      <QaCheckOverlay open={qaCheckOpen} onClose={closeQaCheck} project={currentProject} />
    </Box>
  );
}
