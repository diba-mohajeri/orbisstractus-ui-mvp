import { useState, type ComponentType } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { pageTitleSx } from '../shared/pageStyles';
import { ADMIN_SUBVIEWS } from './navItems';
import DashboardView from './subviews/DashboardView';
import OrganizationsView from './subviews/OrganizationsView';
import UsersView from './subviews/UsersView';
import RolesPermissionsView from './subviews/RolesPermissionsView';
import ProjectAccessView from './subviews/ProjectAccessView';
import WorkflowConfigView from './subviews/WorkflowConfigView';
import ReportConfigView from './subviews/ReportConfigView';
import GovernanceReleaseView from './subviews/GovernanceReleaseView';
import AuditTrailView from './subviews/AuditTrailView';
import SubscriptionView from './subviews/SubscriptionView';
import ApiIntegrationsView from './subviews/ApiIntegrationsView';
import AiAutomationView from './subviews/AiAutomationView';

const SUBVIEW_COMPONENTS: Record<string, ComponentType> = {
  dashboard: DashboardView,
  organizations: OrganizationsView,
  users: UsersView,
  roles: RolesPermissionsView,
  projectAccess: ProjectAccessView,
  workflow: WorkflowConfigView,
  reportConfig: ReportConfigView,
  governance: GovernanceReleaseView,
  audit: AuditTrailView,
  subscription: SubscriptionView,
  integrations: ApiIntegrationsView,
  ai: AiAutomationView,
};

export default function AdministrationPage() {
  const [activeKey, setActiveKey] = useState(ADMIN_SUBVIEWS[0].key);
  const ActiveComponent = SUBVIEW_COMPONENTS[activeKey] ?? DashboardView;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography component="h1" sx={pageTitleSx}>Administration</Typography>
        <Chip label="Platform Governance Layer" size="small" color="success" variant="outlined" />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This layer configures the platform. Employees and Roles &amp; Permissions changes here take
        effect live in the assessment workflow screens (Intake through Delivery) — most other panels
        are read-only reference views.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 2 }}>
        <Stack spacing={0.5}>
          {ADMIN_SUBVIEWS.map((item) => (
            <Box
              key={item.key}
              component="button"
              type="button"
              onClick={() => setActiveKey(item.key)}
              sx={{
                textAlign: 'left',
                font: 'inherit',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: item.key === activeKey ? 'primary.main' : 'divider',
                bgcolor: item.key === activeKey ? '#edf5ff' : '#fff',
                color: item.key === activeKey ? 'primary.main' : 'text.primary',
                borderRadius: 2,
                p: 1.25,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {item.label}
            </Box>
          ))}
        </Stack>

        <Box sx={{ minWidth: 0 }}>
          <ActiveComponent />
        </Box>
      </Box>
    </Box>
  );
}
