import { type ComponentType } from 'react';
import { Alert, Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../../../shared/components/StatusChip';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import { legacyTokens } from '../../../theme/theme';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useObservationStore } from '../../../shared/store/observationStore';
import { useIntakeGovernanceStore } from '../../../shared/store/intakeGovernanceStore';
import { useReportQaStore } from '../../../shared/store/reportQaStore';
import { STAGE_TO_MILESTONE_INDEX, MILESTONE_STAGES } from '../../../domain/projects';
import type { EmployeeRole } from '../../../domain/auth';
import { useDeficienciesForBuilding } from '../../client-portal/api';
import { navyButtonSx, sectionTitleSx, softBlueButtonSx } from '../shared/pageStyles';
import { useCurrentProject } from './useCurrentProject';
import AdminOverviewPanel from './roles/AdminOverviewPanel';
import ExecutiveOverviewPanel from './roles/ExecutiveOverviewPanel';
import IntakeOverviewPanel from './roles/IntakeOverviewPanel';
import InspectorOverviewPanel from './roles/InspectorOverviewPanel';
import AnalystOverviewPanel from './roles/AnalystOverviewPanel';
import ReportQaOverviewPanel from './roles/ReportQaOverviewPanel';
import DeliveryOverviewPanel from './roles/DeliveryOverviewPanel';

const ROLE_PANELS: Record<EmployeeRole, ComponentType> = {
  admin: AdminOverviewPanel,
  platformAdmin: AdminOverviewPanel,
  overview: ExecutiveOverviewPanel,
  intake: IntakeOverviewPanel,
  inspector: InspectorOverviewPanel,
  analysis: AnalystOverviewPanel,
  reportqa: ReportQaOverviewPanel,
  delivery: DeliveryOverviewPanel,
};

const ECOSYSTEM = [
  { title: 'Orbisstractus', description: 'Platform intelligence, data, and automation backbone.' },
  { title: 'InsightX', description: 'Role-based execution from intake through delivery.' },
  { title: 'Orbisstractus Partner Network', description: 'Client-facing portfolio, reports, and collaboration.' },
];

const BUSINESS_LINES = [
  {
    name: 'Building Condition Assessment',
    status: 'Active' as const,
    description: 'ASTM/BCA hierarchy, reporting, QA, delivery, and capital planning logic — being actively built.',
  },
  {
    name: 'Building Envelope',
    status: 'Active' as const,
    description: 'Extends the same workflow with deeper enclosure, roofing, glazing, waterproofing, and defect taxonomy.',
  },
  {
    name: 'Reserve Fund / Capital Planning',
    status: 'Partially Active' as const,
    description: 'Adds funding scenarios, lifecycle forecasting, and long-term capital planning outputs.',
  },
  {
    name: 'Forensic Engineering',
    status: 'Configurable' as const,
    description: 'Failure investigation, evidence records, root-cause analysis, and expert-style reporting.',
  },
  {
    name: 'Energy & Decarbonization',
    status: 'Configurable' as const,
    description: 'Energy audits, retrofit planning, carbon reduction pathways, and performance recommendations.',
  },
  {
    name: 'Commissioning / Retro-Cx',
    status: 'Configurable' as const,
    description: 'Performance verification, system checklists, issue logs, and closeout documentation.',
  },
  {
    name: 'Remediation / Project Management',
    status: 'Configurable' as const,
    description: "Post-assessment execution oversight as Owner's Representative, connected to report findings.",
  },
];

const WORKFLOW_STEPS = [
  { label: 'Intake', to: '/insightx/intake', description: 'PM + Intake Coordinator. Scope, documents, ASTM/BCA code set.' },
  { label: 'Inspect', to: '/insightx/inspector', description: 'Inspector / Field Assessor. Observations, media, L1–L5 coding.' },
  { label: 'Analyse', to: '/insightx/analysis', description: 'Building Science Analyst + Cost Analyst. Deficiencies, RUL, capital estimates.' },
  { label: 'Report', to: '/insightx/report-qa', description: 'Report Specialist. 16-section PEO-aligned narrative + Excel spreadsheet.' },
  { label: 'QA / P.Eng.', to: '/insightx/report-qa', description: 'Reviewing Engineer. Technical validation, seal, and sign-off.' },
  { label: 'Deliver', to: '/insightx/delivery', description: 'PM. Sealed PDF, Word file, mandatory Excel, photo appendix.' },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const role = useAuthStore((s) => s.session?.user.role) ?? 'overview';

  const { currentProject } = useCurrentProject();

  const milestoneIndex = currentProject ? STAGE_TO_MILESTONE_INDEX[currentProject.currentStage] ?? 0 : 0;
  const overallPct = Math.round(((milestoneIndex + 1) / MILESTONE_STAGES.length) * 100);
  const buildingLabel = currentProject?.buildingName ?? 'the current project';

  const roleProgress = [
    { label: 'Intake', pct: milestoneIndex >= 1 ? 100 : 60, status: milestoneIndex >= 1 ? 'Ready' : 'Started' },
    { label: 'Inspector', pct: milestoneIndex > 2 ? 100 : milestoneIndex === 2 ? 60 : 0, status: milestoneIndex > 2 ? 'Ready' : milestoneIndex === 2 ? 'In field' : 'Not started' },
    { label: 'Analysis', pct: milestoneIndex > 3 ? 100 : milestoneIndex === 3 ? 40 : 0, status: milestoneIndex > 3 ? 'Ready' : milestoneIndex === 3 ? 'Started' : 'Not started' },
    { label: 'Report + QA', pct: milestoneIndex > 4 ? 100 : milestoneIndex === 4 ? 30 : 0, status: milestoneIndex > 4 ? 'Ready' : milestoneIndex === 4 ? 'Started' : 'Not started' },
  ];

  const RolePanel = ROLE_PANELS[role];

  const intakeState = useIntakeGovernanceStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const observations = useObservationStore((s) => s.getObservations(currentProject?.id ?? '__none__'));
  const qaState = useReportQaStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const { data: deficiencies } = useDeficienciesForBuilding(currentProject?.buildingId ?? null);

  const reviewedCount = observations.filter((o) => o.reviewed).length;
  const inspectionProgressPct = observations.length > 0 ? Math.round((reviewedCount / observations.length) * 100) : 0;
  const analysisQueueCount = deficiencies?.length ?? 0;
  const highPriorityCount = (deficiencies ?? []).filter((d) => d.severity === 'critical' || d.severity === 'high').length;
  const openFlagCount = qaState.flags.filter((f) => f.status === 'open').length;

  const executiveStatusKpis: KpiTileData[] = [
    { label: 'Intake Readiness', value: `${intakeState.readinessPct}%`, tone: intakeState.readinessPct === 100 ? 'success' : 'neutral' },
    { label: 'Inspection Progress', value: `${inspectionProgressPct}%`, tone: inspectionProgressPct === 100 ? 'success' : 'neutral' },
    { label: 'Analysis Queue', value: String(analysisQueueCount), tone: 'neutral' },
    { label: 'High Priority Items', value: String(highPriorityCount), tone: highPriorityCount > 0 ? 'error' : 'success' },
  ];

  const watchItems: { severity: 'warning' | 'info' | 'success'; message: string; actionLabel?: string; actionTo?: string }[] = [];
  if (highPriorityCount > 0) {
    watchItems.push({
      severity: 'warning',
      message: `${highPriorityCount} high-priority deficiency${highPriorityCount === 1 ? '' : 'ies'} at ${buildingLabel} need cost and RUL review.`,
      actionLabel: 'Go to Analysis',
      actionTo: '/insightx/analysis',
    });
  }
  if (openFlagCount > 0) {
    watchItems.push({
      severity: 'warning',
      message: `${openFlagCount} QA flag${openFlagCount === 1 ? '' : 's'} open for ${buildingLabel}, blocking the P.Eng seal.`,
      actionLabel: 'Go to Report + QA',
      actionTo: '/insightx/report-qa',
    });
  }
  if (!intakeState.scopeApproved) {
    watchItems.push({
      severity: 'info',
      message: `Intake scope for ${buildingLabel} is still pending approval.`,
      actionLabel: 'Go to PM / Intake',
      actionTo: '/insightx/intake',
    });
  }
  if (watchItems.length === 0) {
    watchItems.push({ severity: 'success', message: `No urgent items — ${buildingLabel} workflow is on track.` });
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {ECOSYSTEM.map((e) => (
              <Box key={e.title}>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{e.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {role === 'admin' && (
        <Card sx={{ mb: 2, borderColor: 'success.main' }}>
          <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontWeight: 800 }}>Administration Console</Typography>
                <StatusChip label="Active" tone="success" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Platform governance, users, roles, and release configuration.
              </Typography>
            </Box>
            <Button variant="contained" sx={navyButtonSx} onClick={() => navigate('/insightx/admin')}>
              Open Administration
            </Button>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>
            Building Science Business Lines Supported by Orbisstractus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A single structured platform supporting multiple building science services through configuration
            — not separate systems.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.25 }}>
            {BUSINESS_LINES.map((line) => {
              const isPartiallyActive = line.status === 'Partially Active';
              return (
                <Box
                  key={line.name}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    p: 1.5,
                    bgcolor: line.status === 'Active' ? legacyTokens.greenSoft : isPartiallyActive ? '#fef9c3' : legacyTokens.amberSoft,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {line.name}
                  </Typography>
                  <StatusChip
                    label={line.status}
                    tone={line.status === 'Active' ? 'success' : 'warning'}
                    bg={isPartiallyActive ? '#fef9c3' : undefined}
                    fg={isPartiallyActive ? '#a16207' : undefined}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    {line.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2, mb: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>
              Overview Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentProject
                ? `${currentProject.buildingName} — ${currentProject.serviceLine} assessment currently in ${currentProject.currentStage}.`
                : 'No active project selected.'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.25 }}>
              {WORKFLOW_STEPS.map((step, index) => (
                <Box
                  key={step.label}
                  component="button"
                  type="button"
                  onClick={() => navigate(step.to)}
                  sx={{
                    font: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: '1px solid',
                    borderColor: index <= milestoneIndex ? 'primary.main' : 'divider',
                    bgcolor: index <= milestoneIndex ? '#edf5ff' : '#fff',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {index + 1}. {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
              Executive Status
            </Typography>
            <KpiStrip items={executiveStatusKpis} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Overall project progress
            </Typography>
            <LinearProgress variant="determinate" value={overallPct} sx={{ height: 8, borderRadius: 999, mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {overallPct}% through the assessment workflow
            </Typography>
            <Button variant="contained" fullWidth sx={softBlueButtonSx} onClick={openTechnicalDrawer}>
              View Technical Backbone
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
              Role Progress
            </Typography>
            <Stack spacing={1.5}>
              {roleProgress.map((r) => (
                <Box key={r.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.label}
                    </Typography>
                    <StatusChip label={r.status} tone={r.pct === 100 ? 'success' : r.pct > 0 ? 'warning' : 'neutral'} />
                  </Box>
                  <LinearProgress variant="determinate" value={r.pct} sx={{ height: 6, borderRadius: 999 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
              Current Watch Items
            </Typography>
            <Stack spacing={1.5}>
              {watchItems.map((item, index) => (
                <Alert key={index} severity={item.severity}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 180 }}>
                      {item.message}
                    </Typography>
                    {item.actionLabel && item.actionTo && (
                      <Button size="small" variant="outlined" onClick={() => navigate(item.actionTo!)}>
                        {item.actionLabel}
                      </Button>
                    )}
                  </Stack>
                </Alert>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 2 }}>
        <RolePanel />
      </Box>
    </Box>
  );
}