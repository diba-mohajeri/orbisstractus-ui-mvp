import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ObservationCard, { MEDIA_TYPE_ICON, MEDIA_TYPE_PREFIX } from '../../../shared/components/ObservationCard';
import StatusChip, { severityTone } from '../../../shared/components/StatusChip';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import { useToast } from '../../../shared/store/toastStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { SCOPE_STATUS_LABEL, SCOPE_STATUS_TONE, useIntakeGovernanceStore } from '../../../shared/store/intakeGovernanceStore';
import { useObservationStore, type Observation, type ObservationMediaType } from '../../../shared/store/observationStore';
import {
  useBuildingSummaries,
  useBuildingSystems,
  useDeficienciesForBuilding,
  useProjects,
  useReports,
} from '../../client-portal/api';
import { ASSESSMENT_SCOPE_BY_CONTEXT } from '../pm-intake/assessmentScope';
import { SCOPE_METHOD_BY_SYSTEM, UNIFORMAT_CODE_BY_SYSTEM } from '../pm-intake/uniformatTree';
import { defaultObservationFields, useSeedObservations } from '../../../shared/hooks/useSeedObservations';
import { heroCardContentSx, pageTitleSx, sectionTitleSx, softBlueButtonSx, subsectionTitleSx } from '../shared/pageStyles';
import { useStepAccess } from '../shared/useMyProjectAccess';
import StepAccessGate from '../shared/StepAccessGate';
import NewObservationModal, { type NewObservationValues } from './NewObservationModal';
import CaptureWorkflowDialog, { type CaptureWorkflow } from './CaptureWorkflowDialog';
import { ENVELOPE_APPROVED_SCOPE, EVIDENCE_BY_CONTEXT } from '../shared/approvedScope';
import ScopeStatusRow from '../shared/ScopeStatusRow';

const CAPTURE_STUBS = ['Quick Capture', 'Voice Note', 'Scan Location', 'Upload Drone Media', 'Sync Offline Data'];
const CAPTURE_MODE_BY_LABEL: Record<string, CaptureWorkflow> = {
  'Quick Capture': 'quick',
  'Voice Note': 'voice',
  'Scan Location': 'location',
  'Upload Drone Media': 'drone',
  'Sync Offline Data': 'sync',
};

const AI_ASSISTANT_ACTIONS = ['AI Classify', 'AI Detect Issues', 'AI Draft Finding', 'AI Estimate Severity', 'AI Suggest Repair', 'Merge Duplicates'];
const MEDIA_OPERATIONS_ACTIONS = ['Compare Images', 'Create Markup', 'Generate Panorama', 'Link to Observation', 'Export Evidence'];
const EXECUTION_CONVERSION_ACTIONS = ['Create Deficiency', 'Generate Capital Item', 'Add to Reserve Fund', 'Create Tender Scope'];

interface MediaBucketRequirement {
  type: ObservationMediaType | 'meta';
  label: string;
  min: number;
}

const MEDIA_BUCKET_REQUIREMENTS: MediaBucketRequirement[] = [
  { type: 'meta', label: 'Project Info', min: 1 },
  { type: 'photo', label: 'Photo Evidence', min: 3 },
  { type: 'thermal', label: 'Thermal / IR Evidence', min: 1 },
  { type: 'drone', label: 'Drone / Aerial Evidence', min: 1 },
  { type: 'voice', label: 'Voice Notes', min: 1 },
  { type: 'markup', label: 'Markup / Drawings', min: 1 },
];

const OBSERVATION_FEED_DESCRIPTION_BY_CONTEXT: Record<'bca' | 'envelope', string> = {
  bca: 'BCA context selected: broad building condition scope with lifecycle, capital planning, condition rating, evidence, and QA traceability.',
  envelope:
    'Building Envelope context selected: ASTM tree is filtered to exterior enclosure, roofing, moisture, thermal, sealants, glazing, flashing, and drone/IR evidence workflows.',
};

export default function InspectorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const permissions = useAuthStore((s) => s.session?.user.permissions) ?? [];
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const { data: projects } = useProjects();
  const { data: buildings } = useBuildingSummaries();
  const { data: reports } = useReports();

  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  const { level: stepAccessLevel, isLoading: accessLoading, canEdit } = useStepAccess(currentProject?.id, 'inspector');
  const canCreate = permissions.includes('create') && canEdit;
  const building = buildings?.find((b) => b.id === currentProject?.buildingId);

  const { data: systems } = useBuildingSystems(currentProject?.buildingId ?? null);
  const { data: priorDeficiencies } = useDeficienciesForBuilding(currentProject?.buildingId ?? null);
  const buildingReport = (reports ?? []).find((r) => r.buildingId === currentProject?.buildingId);

  const intakeState = useIntakeGovernanceStore((s) => s.getState(currentProject?.id ?? '__none__'));

  useSeedObservations(currentProject);
  const observations = useObservationStore((s) => s.getObservations(currentProject?.id ?? '__none__'));
  const addObservation = useObservationStore((s) => s.addObservation);
  const updateObservation = useObservationStore((s) => s.updateObservation);

  const [newOpen, setNewOpen] = useState(false);
  const [captureWorkflow, setCaptureWorkflow] = useState<CaptureWorkflow | null>(null);
  const [expandedBucket, setExpandedBucket] = useState<ObservationMediaType | null>(null);

  function handleAddObservation(values: NewObservationValues, observationId: string) {
    if (!currentProject) return;
    const componentByCode: Record<string, string> = {
      B3010: 'Roof Coverings Observation',
      'B3010.10': 'Roof Membrane Observation',
      'B3010.10.02': 'Lap Seams / Membrane Observation',
      B2010: 'Exterior Walls Observation',
    };
    const observation: Observation = {
      id: observationId,
      uniformatCode: values.code,
      component: componentByCode[values.code] ?? `${values.systemName} Observation`,
      systemName: values.systemName,
      condition: values.condition,
      notes: values.notes,
      reviewed: false,
      ...defaultObservationFields(values.systemName),
      method: values.method,
      quantity: values.quantity,
      quantityUnit: values.quantityUnit,
      location: values.location,
      weather: values.weather,
      accessibility: values.accessibility,
    };
    addObservation(currentProject.id, observation);
    setNewOpen(false);
    toast('Observation added.');
  }

  function approveAll() {
    if (!currentProject) return;
    observations.forEach((o) => updateObservation(currentProject.id, o.id, { reviewed: true }));
    toast('All observations marked reviewed.');
  }

  useEffect(() => {
    if (location.hash !== '#prior-deficiencies' || !buildingReport) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('prior-deficiencies')?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [buildingReport, location.hash]);

  if (!currentProject || !building) {
    return <Typography color="text.secondary">Loading project…</Typography>;
  }

  const assessmentScope = ASSESSMENT_SCOPE_BY_CONTEXT[intakeState.approvedOperationalContext];
  const approvedContextLabel = intakeState.approvedOperationalContext === 'envelope' ? 'Building Envelope' : 'BCA';
  const workbookStrategy = intakeState.approvedOperationalContext === 'envelope'
    ? 'Envelope Engineering Workbook'
    : 'BCA Engineering Workbook';

  const reviewedCount = observations.filter((o) => o.reviewed).length;
  const completenessPct = observations.length > 0 ? Math.round((reviewedCount / observations.length) * 100) : 0;
  const needsEvidenceCount = observations.filter((o) => o.media.filter((m) => m.type === 'photo').length === 0).length;
  const mediaLinked = observations.reduce((sum, o) => sum + o.media.length, 0);
  const focusObservation = observations[0] ?? null;
  const focusCompletenessPct = focusObservation
    ? Math.round(
        ([focusObservation.location.trim(), focusObservation.notes.trim(), focusObservation.media.length > 0 ? '1' : ''].filter(Boolean).length / 3) * 100,
      )
    : 0;

  const allMediaWithSource = observations.flatMap((o) =>
    o.media.map((m) => ({ ...m, observationId: o.id, observationLabel: o.component })),
  );
  const checklistCompleteCount = MEDIA_BUCKET_REQUIREMENTS.filter(
    (req) => (req.type === 'meta' ? 1 : allMediaWithSource.filter((m) => m.type === req.type).length) >= req.min,
  ).length;
  const checklistCompletePct = Math.round((checklistCompleteCount / MEDIA_BUCKET_REQUIREMENTS.length) * 100);

  function removeAggregatedMedia(observationId: string, mediaId: string) {
    const target = observations.find((o) => o.id === observationId);
    if (!target) return;
    updateObservation(currentProject.id, observationId, { media: target.media.filter((m) => m.id !== mediaId) });
  }

  const headerMetrics: KpiTileData[] = [
    { label: 'Observations Captured', value: String(observations.length), tone: 'neutral' },
    { label: 'Media Linked', value: String(mediaLinked), tone: 'neutral' },
    { label: 'Completeness', value: `${completenessPct}%`, tone: completenessPct === 100 ? 'success' : 'neutral' },
    { label: 'Needs Evidence', value: String(needsEvidenceCount), tone: needsEvidenceCount > 0 ? 'warning' : 'success' },
  ];
  const nextObservationNumber = Math.max(
    15,
    ...observations.map((observation) => Number(observation.id.match(/(\d+)$/)?.[1] ?? 0)),
  ) + 1;
  const nextObservationId = `OBS-NEW-${nextObservationNumber}`;


  return (
    <StepAccessGate level={stepAccessLevel} stepLabel="Inspector" isLoading={accessLoading}>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
            PM Intake ASTM Governance
          </Typography>
          <Alert severity="success" sx={{ mb: 1.5, fontSize: 13 }}>
            The ASTM System Navigator is governed by the PM / Intake role. Operational context, scope
            matrix, exclusions, evidence requirements, and workbook/report structures are approved before
            inspection begins.
          </Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                Approved Operational Context
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{approvedContextLabel}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Approved assessment context
                    </Typography>
                  </Box>
                  <StatusChip label="Active" tone="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>Scope Governance</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ASTM scope matrix approved and locked before field inspection
                    </Typography>
                  </Box>
                  <StatusChip label={intakeState.scopeApproved ? 'Approved' : 'Pending'} tone={intakeState.scopeApproved ? 'success' : 'warning'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25, gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>Evidence Requirements</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assessmentScope.evidence}
                    </Typography>
                  </Box>
                  <StatusChip label="Configured" tone="warning" />
                </Box>
              </Stack>
            </Box>
            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                Approved Scope Package
              </Typography>
              <Stack spacing={1} sx={{ mb: 1.5 }}>
                {assessmentScope.cards.slice(0, 4).map((c) => (
                  <Box key={c.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {c.name}
                    </Typography>
                    <StatusChip label={c.status} tone={c.status === 'In Scope' || c.status === 'Required' ? 'success' : 'warning'} />
                  </Box>
                ))}
              </Stack>
              <Alert severity="info" sx={{ fontSize: 13 }}>
                Inspector workflows inherit the approved ASTM scope package and cannot redefine engagement
                scope.
              </Alert>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={heroCardContentSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography component="h1" sx={pageTitleSx}>Inspector — Field Execution</Typography>
              <Typography variant="body2" color="text.secondary">
                {building.name} — {currentProject.serviceLine} assessment
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Tooltip title={canCreate ? '' : "You don't have Create permission."} disableHoverListener={canCreate}>
                <span>
                  <Button variant="contained" onClick={() => setNewOpen(true)} disabled={!canCreate}>
                    + New Observation
                  </Button>
                </span>
              </Tooltip>
              {CAPTURE_STUBS.map((label) => (
                <Button key={label} variant="contained" sx={softBlueButtonSx} onClick={() => setCaptureWorkflow(CAPTURE_MODE_BY_LABEL[label])}>
                  {label}
                </Button>
              ))}
            </Stack>
          </Box>
          <KpiStrip items={headerMetrics} />
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr .9fr' }, gap: 2 }}>
        <Card sx={{ gridColumn: '1 / -1' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              Approved Inspection Scope
            </Typography>
            {intakeState.scopeApproved ? (
              <Alert severity="success" sx={{ mb: 1.5, fontSize: 13 }}>
                <strong>Scope locked by PM / Intake.</strong> Inspector executes against the approved ASTM
                scope package and captures evidence, observations, media, location, condition, and QA
                completeness.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 1.5, fontSize: 13 }}>
                Scope not yet approved in PM/Intake.
              </Alert>
            )}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              {[
                ['Approved Context', approvedContextLabel],
                ['Scope Source', 'PM / Intake · ASTM Governance & Scope Definition'],
                ['Inspector Role', 'Field execution only — no scope governance'],
                ['Workbook Strategy', workbookStrategy],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '280px 1fr' }, borderTop: '1px solid', borderColor: 'divider', '&:first-of-type': { borderTop: 0 } }}>
                  <Typography variant="body2" sx={{ bgcolor: '#f3f5f8', fontWeight: 800, px: 2, py: 1.4 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ px: 2, py: 1.4 }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Approved Scope Summary</Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {ENVELOPE_APPROVED_SCOPE.filter((row) => row.code !== 'B3020').map((row) => {
                const statusKey = row.code === 'B20' ? 'Building Envelope' : row.code === 'B30' ? 'Roofing' : row.code;
                const status = intakeState.systemScopeStatus[statusKey] ?? row.defaultStatus;
                return <ScopeStatusRow key={row.code} code={row.code} name={row.name} status={status} />;
              })}
            </Stack>

            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
              Required Evidence
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {EVIDENCE_BY_CONTEXT[intakeState.approvedOperationalContext].map((item) => (
                <Box key={item.title} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1.35 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                  </Box>
                  <StatusChip label={item.status} tone={item.status === 'Required' ? 'success' : 'warning'} />
                </Box>
              ))}
            </Stack>

            <Stack spacing={1}>
              <Button size="small" variant="contained" sx={softBlueButtonSx} onClick={() => navigate('/insightx/intake')}>
                View PM Scope Governance
              </Button>
              <Button size="small" variant="outlined" onClick={openTechnicalDrawer}>
                Open Inspector Technical Layer
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              Active Observation Feed · {approvedContextLabel}
            </Typography>
            <Alert severity="success" sx={{ mb: 1.5, fontSize: 13 }}>
              {OBSERVATION_FEED_DESCRIPTION_BY_CONTEXT[intakeState.approvedOperationalContext]}
            </Alert>
            {observations.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No observations yet. Click "+ New Observation" to add one.
              </Typography>
            )}
            {observations.map((o) => (
              <ObservationCard
                key={o.id}
                observation={o}
                onChange={(patch) => updateObservation(currentProject.id, o.id, patch)}
                onCreateDeficiency={() => toast(`Deficiency created from ${o.component} and queued for Analyst review.`)}
                onRequestReview={() => toast('Observation sent to reviewer.')}
                onApprove={() => {
                  updateObservation(currentProject.id, o.id, { reviewed: true });
                  toast(`${o.component} approved.`);
                }}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  AI Assistant
                </Typography>
                <Stack spacing={1}>
                  {AI_ASSISTANT_ACTIONS.map((label) => (
                    <Button key={label} size="small" variant="outlined" fullWidth onClick={() => toast(`${label} ships in a later phase.`)}>
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Media Operations
                </Typography>
                <Stack spacing={1}>
                  {MEDIA_OPERATIONS_ACTIONS.map((label) => (
                    <Button key={label} size="small" variant="outlined" fullWidth onClick={() => toast(`${label} requires a connected device.`)}>
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Inspection Validation
                </Typography>
                {focusObservation ? (
                  <Stack spacing={0.75} sx={{ mb: 1 }}>
                    <Alert severity="success" sx={{ fontSize: 12 }}>
                      {OBSERVATION_FEED_DESCRIPTION_BY_CONTEXT[intakeState.approvedOperationalContext]}
                    </Alert>
                    <Alert severity={focusCompletenessPct === 100 ? 'success' : 'warning'} sx={{ fontSize: 12 }}>
                      {focusObservation.component} completeness: {focusCompletenessPct}%.{' '}
                      {focusCompletenessPct === 100 ? 'Ready for approval.' : 'Add photo QA label and confirm extent.'}
                    </Alert>
                    {focusObservation.media.filter((m) => m.type === 'thermal' || m.type === 'drone').length === 0 && (
                      <Alert severity="info" sx={{ fontSize: 12 }}>
                        Drone / thermal media is optional for this {approvedContextLabel} record but can strengthen evidence.
                      </Alert>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No observations yet to validate.
                  </Typography>
                )}
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    disabled={!focusObservation}
                    onClick={() => focusObservation && toast(`Evidence validated for ${focusObservation.component}.`)}
                  >
                    Validate Evidence
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    disabled={!focusObservation}
                    onClick={() => focusObservation && toast(`Location verified for ${focusObservation.component}.`)}
                  >
                    Verify Location
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    disabled={!focusObservation}
                    onClick={() => focusObservation && toast(`${focusObservation.component} completeness: ${focusCompletenessPct}%.`)}
                  >
                    Check Completeness
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  <Button size="small" variant="contained" fullWidth onClick={approveAll} disabled={observations.length === 0}>
                    Approve All Observations
                  </Button>
                  <Button size="small" variant="outlined" fullWidth onClick={() => toast('Returned for revision.')}>
                    Return for Revision
                  </Button>
                </Stack>
              </Box>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Execution Conversion
                </Typography>
                <Stack spacing={1}>
                  {EXECUTION_CONVERSION_ACTIONS.map((label) => (
                    <Button
                      key={label}
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() =>
                        label === 'Create Deficiency'
                          ? toast(`Deficiency created from ${focusObservation?.component ?? 'observation'} and queued for Analyst review.`)
                          : toast(`${label} — queued.`)
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            <Typography sx={sectionTitleSx}>
              {approvedContextLabel} Intake Checklist
            </Typography>
            <StatusChip label={`${checklistCompletePct}% complete`} tone={checklistCompletePct === 100 ? 'success' : 'warning'} />
          </Box>
          <Stack spacing={1}>
            {MEDIA_BUCKET_REQUIREMENTS.map((req) => {
              const items = req.type === 'meta' ? [] : allMediaWithSource.filter((m) => m.type === req.type);
              const count = req.type === 'meta' ? 1 : items.length;
              const ok = count >= req.min;
              const isExpanded = expandedBucket === req.type;
              return (
                <Box key={req.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ minWidth: 150 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {req.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min {req.min}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {count} of {req.min}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5, alignItems: 'center' }}>
                      {items.slice(0, 6).map((m) => {
                        const ItemIcon = MEDIA_TYPE_ICON[m.type];
                        return <ItemIcon key={m.id} sx={{ fontSize: 18, color: 'text.secondary' }} />;
                      })}
                      {items.length > 6 && <StatusChip label={`+${items.length - 6}`} tone="neutral" />}
                    </Stack>
                    <StatusChip label={ok ? 'Complete' : `${req.min - count} missing`} tone={ok ? 'success' : 'warning'} />
                    <Stack direction="row" spacing={1}>
                      {req.type === 'meta' ? (
                        <Button size="small" variant="outlined" onClick={() => navigate('/insightx/intake')}>
                          View Record
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toast('Add media via the relevant observation in the Active Observation Feed.')}
                          >
                            + Add
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            disabled={items.length === 0}
                            onClick={() => setExpandedBucket(isExpanded ? null : req.type as ObservationMediaType)}
                          >
                            {isExpanded ? 'Hide' : 'View All'}
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Box>
                  {isExpanded && items.length > 0 && (
                    <Stack spacing={0.75} sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                      {items.map((m) => (
                        <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {MEDIA_TYPE_PREFIX[m.type]} · {m.caption} — {m.observationLabel}
                          </Typography>
                          <Button size="small" color="error" onClick={() => removeAggregatedMedia(m.observationId, m.id)}>
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              Assessment Scope · Reference
            </Typography>
            <Alert severity="success" sx={{ mb: 1.5, fontSize: 13 }}>
              Scope package received from PM/Intake. Inspect only systems marked In Scope or Limited.
            </Alert>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              {(systems ?? []).map((s) => {
                const status = intakeState.systemScopeStatus[s.systemName] ?? 'inScope';
                return (
                  <Box
                    key={s.id}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1, gap: 1 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {UNIFORMAT_CODE_BY_SYSTEM[s.systemName]} · {s.systemName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {SCOPE_METHOD_BY_SYSTEM[s.systemName]}
                      </Typography>
                    </Box>
                    <StatusChip label={SCOPE_STATUS_LABEL[status]} tone={SCOPE_STATUS_TONE[status]} />
                  </Box>
                );
              })}
            </Stack>
            <Button size="small" variant="outlined" onClick={() => navigate('/insightx/intake')}>
              View Full Scope Package
            </Button>
          </CardContent>
        </Card>

        <Card id="prior-deficiencies" sx={{ scrollMarginTop: 110 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              Prior Deficiencies · Known Concerns
            </Typography>
            {priorDeficiencies && priorDeficiencies.length > 0 ? (
              <>
                <Alert severity="warning" sx={{ mb: 1.5, fontSize: 13 }}>
                  {priorDeficiencies.length} deficienc{priorDeficiencies.length === 1 ? 'y' : 'ies'} on file for this building. Verify
                  current status on site and update condition rating.
                </Alert>
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {priorDeficiencies.slice(0, 5).map((d) => (
                    <Box key={d.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1, gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {d.systemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.description}
                        </Typography>
                      </Box>
                      <StatusChip label={d.severity} tone={severityTone(d.severity)} />
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                No prior deficiencies on file for this building.
              </Typography>
            )}
            <Button
              size="small"
              variant="outlined"
              disabled={!buildingReport}
              onClick={() => buildingReport && navigate(
                `/report-viewer/${buildingReport.id}?mode=preview&from=inspector`,
                { state: { returnTo: '/insightx/inspector#prior-deficiencies', returnLabel: 'Close Prior Report' } },
              )}
            >
              View Prior Report
            </Button>
          </CardContent>
        </Card>
      </Box>

      <NewObservationModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        observationId={nextObservationId}
        defaultCode="B3010"
        onSave={(values) => handleAddObservation(values, nextObservationId)}
      />
      <CaptureWorkflowDialog
        mode={captureWorkflow}
        observations={observations}
        onClose={() => setCaptureWorkflow(null)}
        onUpdateObservation={(id, patch) => updateObservation(currentProject.id, id, patch)}
      />
    </Box>
    </StepAccessGate>
  );
}
