import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useIntakeGovernanceStore } from '../../../../shared/store/intakeGovernanceStore';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useCurrentProject } from '../useCurrentProject';

export default function IntakeOverviewPanel() {
  const navigate = useNavigate();
  const { currentProject, activeProjects } = useCurrentProject();
  const governance = useIntakeGovernanceStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const plannedCount = activeProjects.filter((p) => p.status === 'planned').length;

  const kpis: KpiTileData[] = [
    { label: 'Scope Approved', value: governance.scopeApproved ? 'Yes' : 'No', tone: governance.scopeApproved ? 'success' : 'warning' },
    { label: 'Readiness Complete', value: governance.readinessComplete ? 'Yes' : 'No', tone: governance.readinessComplete ? 'success' : 'neutral' },
    {
      label: 'Excluded Systems',
      value: String(Object.values(governance.systemScopeStatus).filter((s) => s === 'excluded').length),
      tone: 'neutral',
    },
    { label: 'Projects Awaiting Intake', value: String(plannedCount), tone: 'neutral' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          PM / Intake Status
        </Typography>
        <KpiStrip items={kpis} />
        {governance.scopeApproved ? (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            Scope approved for {currentProject?.buildingName ?? 'the current project'} — ready for
            Inspector handoff.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Scope for {currentProject?.buildingName ?? 'the current project'} is still pending approval.
          </Alert>
        )}
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/intake')}>
          Go to PM / Intake
        </Button>
      </CardContent>
    </Card>
  );
}