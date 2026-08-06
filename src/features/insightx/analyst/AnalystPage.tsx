import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import KpiStrip from '../../../shared/components/KpiStrip';
import SectionedFormTable from '../../../shared/components/SectionedFormTable';
import StatusChip, { conditionTone, riskTone, severityTone } from '../../../shared/components/StatusChip';
import DataTable from '../../../shared/components/DataTable';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import { MEDIA_TILE_COLOR, MEDIA_TYPE_ICON, MEDIA_TYPE_PREFIX } from '../../../shared/components/ObservationCard';
import { useToast } from '../../../shared/store/toastStore';
import { useAuditLogStore } from '../../../shared/store/auditLogStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useObservationStore } from '../../../shared/store/observationStore';
import { useIntakeGovernanceStore } from '../../../shared/store/intakeGovernanceStore';
import { useSeedObservations } from '../../../shared/hooks/useSeedObservations';
import { formatCurrency } from '../../../shared/utils/format';
import type { Condition, DeficiencySeverity } from '../../../domain/portfolioAssets';
import { legacyTokens } from '../../../theme/theme';
import { heroCardContentSx, navyButtonSx, pageTitleSx, sectionTitleSx, softBlueButtonSx, subsectionTitleSx } from '../shared/pageStyles';
import { useStepAccess } from '../shared/useMyProjectAccess';
import StepAccessGate from '../shared/StepAccessGate';
import {
  useAssetRecords,
  useBuildingSummaries,
  useCapitalPlanRows,
  useDeficienciesForBuilding,
  useProjects,
} from '../../client-portal/api';
import AssetDetailPanel from '../../client-portal/asset-management/AssetDetailPanel';
import { getUniformatBreadcrumb, UNIFORMAT_CODE_BY_SYSTEM } from '../pm-intake/uniformatTree';
import { useCreateCapitalPlanItem, useCreateDeficiency } from './api';
import {
  CODE_COMPLIANCE_FLAGS,
  DEFAULT_DEFICIENCY_TYPE_BY_SYSTEM,
  DEFAULT_FAILURE_MECHANISM_BY_SYSTEM,
  DEFAULT_RISK_TYPE_BY_SYSTEM,
  DEFAULT_UNIT_RATE_BY_SYSTEM,
  DEFICIENCY_TYPES,
  FAILURE_MECHANISMS,
  PHASING_OPTIONS,
  PRIORITY_TIMEFRAMES,
  RATE_SOURCES,
  RECOMMENDATION_TYPES,
  RISK_LEVELS,
  RISK_TYPES,
  RUL_BASES,
  RUL_STATUSES,
  SEVERITY_OPTIONS,
  SUBCATEGORIES,
} from './classification';

const DEFAULT_SEVERITY_BY_CONDITION: Record<Condition, DeficiencySeverity> = {
  critical: 'critical',
  poor: 'high',
  fair: 'medium',
  good: 'low',
};

const COST_ESTIMATE_BY_SEVERITY: Record<DeficiencySeverity, number> = {
  critical: 150_000,
  high: 80_000,
  medium: 30_000,
  low: 10_000,
};

const PRIORITY_TIMEFRAME_BY_SEVERITY: Record<DeficiencySeverity, string> = {
  critical: PRIORITY_TIMEFRAMES[0],
  high: PRIORITY_TIMEFRAMES[1],
  medium: PRIORITY_TIMEFRAMES[2],
  low: PRIORITY_TIMEFRAMES[4],
};

const RUL_STATUS_BY_SEVERITY: Record<DeficiencySeverity, string> = {
  critical: RUL_STATUSES[0],
  high: RUL_STATUSES[0],
  medium: RUL_STATUSES[2],
  low: RUL_STATUSES[3],
};

const COST_STANDARDS_REFERENCE = [
  { source: 'RSMeans 2025', usedFor: 'Roofing, envelope, sitework unit rates — Toronto region' },
  { source: 'CIQS', usedFor: 'Canadian construction cost benchmarks' },
  { source: 'Internal library', usedFor: 'Historical MEP repair and replacement costs' },
  { source: 'Contractor quote', usedFor: 'Used when available — overrides benchmark' },
];

const PLANNING_HORIZON_YEARS = { immediateMax: 2026, shortTermMax: 2028, mediumTermMax: 2031 };

const costPanelSx = {
  bgcolor: '#fff',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 3,
  boxShadow: legacyTokens.shadow,
  p: { xs: 2, md: 2.5 },
};

function sourceCodeFor(systemName: keyof typeof UNIFORMAT_CODE_BY_SYSTEM) {
  const code = UNIFORMAT_CODE_BY_SYSTEM[systemName];
  const breadcrumb = getUniformatBreadcrumb(code);
  const l2Title = breadcrumb.split(' › ')[1] ?? systemName;
  return `${code} · ${l2Title}`;
}

export default function AnalystPage() {
  const toast = useToast();
  const logEvent = useAuditLogStore((s) => s.logEvent);
  const permissions = useAuthStore((s) => s.session?.user.permissions) ?? [];
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const { data: projects } = useProjects();
  const { data: buildings } = useBuildingSummaries();
  const { data: capitalPlan } = useCapitalPlanRows();
  const createDeficiency = useCreateDeficiency();
  const createCapitalPlanItem = useCreateCapitalPlanItem();

  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  const { level: stepAccessLevel, isLoading: accessLoading, canEdit } = useStepAccess(currentProject?.id, 'analysis');
  const canApprove = permissions.includes('approve') && canEdit;
  const building = buildings?.find((b) => b.id === currentProject?.buildingId);

  const { data: buildingDeficiencies } = useDeficienciesForBuilding(currentProject?.buildingId ?? null);

  const roofAssetQuery = useAssetRecords({
    buildingId: currentProject?.buildingId,
    systemName: 'Roofing',
    page: 0,
    pageSize: 50,
  });

  const inventoryAssetQuery = useAssetRecords({
    buildingId: currentProject?.buildingId,
    page: 0,
    pageSize: 200,
  });
  const [selectedInventoryAssetId, setSelectedInventoryAssetId] = useState<string | null>(null);
  const selectedInventoryAsset = (inventoryAssetQuery.data?.rows ?? []).find((r) => r.id === selectedInventoryAssetId);

  useSeedObservations(currentProject);
  const observations = useObservationStore((s) => s.getObservations(currentProject?.id ?? '__none__'));
  const updateObservation = useObservationStore((s) => s.updateObservation);
  const intakeState = useIntakeGovernanceStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const approvedContextLabel = intakeState.approvedOperationalContext === 'envelope' ? 'Building Envelope' : 'BCA';

  const [roleTab, setRoleTab] = useState<'bsa' | 'cost' | 'reserve'>('bsa');
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);

  const [severity, setSeverity] = useState<DeficiencySeverity>('medium');
  const [deficiencyType, setDeficiencyType] = useState(DEFICIENCY_TYPES[1]);
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[0]);
  const [riskType, setRiskType] = useState(RISK_TYPES[5]);
  const [riskLevel, setRiskLevel] = useState<DeficiencySeverity>('medium');
  const [codeComplianceFlag, setCodeComplianceFlag] = useState(CODE_COMPLIANCE_FLAGS[0]);
  const [priorityTimeframe, setPriorityTimeframe] = useState(PRIORITY_TIMEFRAMES[2]);
  const [rulBasis, setRulBasis] = useState(RUL_BASES[0]);
  const [rulStatus, setRulStatus] = useState(RUL_STATUSES[2]);
  const [failureMechanism, setFailureMechanism] = useState(FAILURE_MECHANISMS[0]);
  const [recommendationType, setRecommendationType] = useState(RECOMMENDATION_TYPES[2]);
  const [recommendationScope, setRecommendationScope] = useState('');
  const [costTrigger, setCostTrigger] = useState('');
  const [deficiencyStatement, setDeficiencyStatement] = useState('');
  const [clientNarrative, setClientNarrative] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [deviationReason, setDeviationReason] = useState('');
  const [lastCreated, setLastCreated] = useState<{ deficiencyId: string; actionId: string } | null>(null);

  const [unitRate, setUnitRate] = useState(180);
  const [escalationPct, setEscalationPct] = useState(5);
  const [contingencyPct, setContingencyPct] = useState(15);
  const [softCostsPct, setSoftCostsPct] = useState(12);
  const [phasingLabel, setPhasingLabel] = useState(PHASING_OPTIONS[0]);
  const [reserveFundEligible, setReserveFundEligible] = useState(true);
  const [rateSource, setRateSource] = useState(RATE_SOURCES[0]);
  const [costNotes, setCostNotes] = useState('Unit rate based on 2025 RSMeans roofing benchmark adjusted for Toronto market conditions.');
  const [lastCostEntry, setLastCostEntry] = useState<{ id: string } | null>(null);

  const selectedObs = observations.find((o) => o.id === selectedObsId) ?? null;
  const defaultSeverity = selectedObs ? DEFAULT_SEVERITY_BY_CONDITION[selectedObs.condition] : 'medium';
  const isDeviated = selectedObs ? severity !== defaultSeverity : false;

  function selectObservation(obsId: string) {
    const obs = observations.find((o) => o.id === obsId);
    if (!obs) return;
    const sev = DEFAULT_SEVERITY_BY_CONDITION[obs.condition];
    const existingDeficiency = (buildingDeficiencies ?? []).find((d) => d.sourceObservationId === obsId);
    const existingCostEntry = existingDeficiency
      ? (capitalPlan ?? []).find((c) => c.sourceDeficiencyId === existingDeficiency.id)
      : undefined;

    setSelectedObsId(obsId);
    setSeverity(existingDeficiency?.severity ?? sev);
    setDeficiencyType(existingDeficiency?.deficiencyType ?? DEFAULT_DEFICIENCY_TYPE_BY_SYSTEM[obs.systemName]);
    setSubcategory(existingDeficiency?.subcategory ?? SUBCATEGORIES[0]);
    setRiskType(existingDeficiency?.riskType ?? DEFAULT_RISK_TYPE_BY_SYSTEM[obs.systemName]);
    setRiskLevel(existingDeficiency?.riskLevel ?? sev);
    setCodeComplianceFlag(existingDeficiency?.codeComplianceFlag ?? CODE_COMPLIANCE_FLAGS[0]);
    setPriorityTimeframe(existingDeficiency?.priorityTimeframe ?? PRIORITY_TIMEFRAME_BY_SEVERITY[sev]);
    setRulBasis(existingDeficiency?.rulBasis ?? RUL_BASES[0]);
    setRulStatus(existingDeficiency?.rulStatus ?? RUL_STATUS_BY_SEVERITY[sev]);
    setFailureMechanism(existingDeficiency?.failureMechanism ?? DEFAULT_FAILURE_MECHANISM_BY_SYSTEM[obs.systemName]);
    setRecommendationType(existingDeficiency?.recommendationType ?? RECOMMENDATION_TYPES[2]);
    setRecommendationScope(existingDeficiency?.recommendationScope ?? '');
    setCostTrigger('');
    setDeficiencyStatement(existingDeficiency?.deficiencyStatement ?? '');
    setClientNarrative(existingDeficiency?.clientNarrative ?? '');
    setRecommendedAction(existingDeficiency?.recommendedAction ?? '');
    setDeviationReason(existingDeficiency?.deviationReason ?? '');
    setLastCreated(existingDeficiency ? { deficiencyId: existingDeficiency.id, actionId: '' } : null);
    setUnitRate(existingCostEntry?.unitRate ?? DEFAULT_UNIT_RATE_BY_SYSTEM[obs.systemName]);
    setEscalationPct(existingCostEntry?.escalationPct ?? 5);
    setContingencyPct(existingCostEntry?.contingencyPct ?? 15);
    setSoftCostsPct(existingCostEntry?.softCostsPct ?? 12);
    setPhasingLabel(existingCostEntry?.phasingLabel ?? PHASING_OPTIONS[0]);
    setReserveFundEligible(existingCostEntry?.reserveFundEligible ?? true);
    setRateSource(existingCostEntry?.rateSource ?? RATE_SOURCES[0]);
    setCostNotes(existingCostEntry?.costNotes ?? '');
    setLastCostEntry(existingCostEntry ? { id: existingCostEntry.id } : null);
  }

  function handleApproveDeficiency() {
    if (!currentProject || !selectedObs || !recommendedAction.trim()) return;
    if (isDeviated && !deviationReason.trim()) return;

    const estimatedCost = COST_ESTIMATE_BY_SEVERITY[severity];

    createDeficiency.mutate(
      {
        buildingId: currentProject.buildingId,
        systemName: selectedObs.systemName,
        description: recommendedAction.trim(),
        severity,
        estimatedCost,
        sourceObservationId: selectedObs.id,
        deficiencyType,
        subcategory,
        riskType,
        riskLevel,
        codeComplianceFlag,
        priorityTimeframe,
        rulBasis,
        rulStatus,
        failureMechanism,
        recommendationType,
        recommendationScope: recommendationScope.trim() || undefined,
        deficiencyStatement: deficiencyStatement.trim() || undefined,
        clientNarrative: clientNarrative.trim() || undefined,
        recommendedAction: recommendedAction.trim(),
        deviationReason: isDeviated ? deviationReason.trim() : undefined,
      },
      {
        onSuccess: (result) => {
          updateObservation(currentProject.id, selectedObs.id, { reviewed: true });
          setLastCreated({ deficiencyId: result.deficiency.id, actionId: result.action.id });
          toast('Deficiency approved and sent to Cost Analyst.');
          logEvent('Finding approved', `${result.deficiency.id} — ${selectedObs.component} at ${currentProject.buildingId}`);
        },
      },
    );
  }

  const buildingCapitalPlan = useMemo(
    () => (capitalPlan ?? []).filter((c) => c.buildingId === currentProject?.buildingId),
    [capitalPlan, currentProject?.buildingId],
  );

  const quantity = selectedObs?.quantity ?? 0;
  const quantityUnit = selectedObs?.quantityUnit ?? '';
  const baseCost = quantity * unitRate;
  const totalAllowance = baseCost * (1 + escalationPct / 100) * (1 + contingencyPct / 100) * (1 + softCostsPct / 100);

  function handleApproveCostEntry() {
    if (!currentProject || !selectedObs || !lastCreated) return;

    createCapitalPlanItem.mutate(
      {
        buildingId: currentProject.buildingId,
        systemName: selectedObs.systemName,
        recommendedWork: recommendedAction.trim() || selectedObs.component,
        priority: severity,
        forecastCost: totalAllowance,
        phasingLabel,
        reserveFundEligible,
        sourceDeficiencyId: lastCreated.deficiencyId,
        quantity,
        quantityUnit,
        unitRate,
        softCostsPct,
        escalationPct,
        contingencyPct,
        rateSource,
        costNotes: costNotes.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          setLastCostEntry({ id: result.item.id });
          toast('Cost entry approved and added to the capital plan.');
          logEvent('Cost entry approved', `${result.item.id} — ${selectedObs.component} at ${currentProject.buildingId}`);
        },
      },
    );
  }

  const horizons = useMemo(() => {
    const immediate = buildingCapitalPlan
      .filter((c) => c.year <= PLANNING_HORIZON_YEARS.immediateMax)
      .reduce((s, c) => s + c.forecastCost, 0);
    const shortTerm = buildingCapitalPlan
      .filter((c) => c.year > PLANNING_HORIZON_YEARS.immediateMax && c.year <= PLANNING_HORIZON_YEARS.shortTermMax)
      .reduce((s, c) => s + c.forecastCost, 0);
    const mediumTerm = buildingCapitalPlan
      .filter((c) => c.year > PLANNING_HORIZON_YEARS.shortTermMax && c.year <= PLANNING_HORIZON_YEARS.mediumTermMax)
      .reduce((s, c) => s + c.forecastCost, 0);
    const reserveFundTotal = buildingCapitalPlan
      .filter((c) => c.fundingSource === 'Reserve Fund')
      .reduce((s, c) => s + c.forecastCost, 0);
    return { immediate, shortTerm, mediumTerm, fiveYearTotal: immediate + shortTerm + mediumTerm, reserveFundTotal };
  }, [buildingCapitalPlan]);

  const roofRecords = roofAssetQuery.data?.rows ?? [];
  const roofRulLabel =
    roofRecords.length > 0
      ? (() => {
          const years = roofRecords.map((r) => r.remainingUsefulLifeYears);
          const min = Math.min(...years);
          const max = Math.max(...years);
          return min === max ? `${min}` : `${min}–${max}`;
        })()
      : '—';
  const hsFlagCount = observations.filter((o) => o.condition === 'critical').length;
  const openRepairAllowance = observations
    .filter((o) => !o.reviewed)
    .reduce((sum, o) => sum + COST_ESTIMATE_BY_SEVERITY[DEFAULT_SEVERITY_BY_CONDITION[o.condition]], 0);

  if (!currentProject || !building) {
    return <Typography color="text.secondary">Loading project…</Typography>;
  }

  return (
    <StepAccessGate level={stepAccessLevel} stepLabel="Analyst" isLoading={accessLoading}>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={heroCardContentSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography component="h1" sx={pageTitleSx}>Analyst Workspace · {approvedContextLabel}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
                {approvedContextLabel} analysis focuses on deficiencies, risk, RUL, cost, priority, lifecycle
                planning, and capital forecasting.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button
                variant="contained"
                sx={navyButtonSx}
                onClick={handleApproveDeficiency}
                disabled={
                  !selectedObs ||
                  !recommendedAction.trim() ||
                  (isDeviated && !deviationReason.trim()) ||
                  createDeficiency.isPending ||
                  !canApprove
                }
              >
                Approve Deficiency
              </Button>
              <Button variant="contained" sx={softBlueButtonSx} onClick={openTechnicalDrawer}>
                Open Analysis Technical Layer
              </Button>
            </Stack>
          </Box>
          <KpiStrip
            items={[
              { label: 'Items in queue', value: String(observations.length) },
              { label: 'H&S flag', value: String(hsFlagCount), tone: hsFlagCount > 0 ? 'error' : 'success' },
              { label: 'Roof RUL years', value: roofRulLabel },
              { label: 'Repair allowance', value: formatCurrency(openRepairAllowance) },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Tabs
            value={roleTab}
            onChange={(_, v) => setRoleTab(v)}
            sx={{
              mb: 2.5,
              bgcolor: '#f3f5f8',
              borderRadius: 2.5,
              p: 0.75,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-flexContainer': { gap: 0.75 },
              '& .MuiTab-root': { minHeight: 36, border: '1px solid transparent', borderRadius: 2, color: 'text.secondary' },
              '& .Mui-selected': { bgcolor: '#fff', borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            <Tab value="bsa" label="Building Science Analyst" />
            <Tab value="cost" label="Cost Analyst" />
          </Tabs>

          {roleTab === 'bsa' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '.85fr 1.3fr 1.05fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
                  Observation Review Queue · {approvedContextLabel}
                </Typography>
                {observations.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No observations from Inspector yet.
                  </Typography>
                )}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {observations.map((o) => {
                    const status = o.reviewed
                      ? { label: 'Ready', tone: 'success' as const }
                      : o.id === selectedObsId
                        ? { label: 'In Review', tone: 'neutral' as const }
                        : { label: 'Needs analysis', tone: 'warning' as const };
                    return (
                      <Box
                        key={o.id}
                        component="button"
                        type="button"
                        onClick={() => selectObservation(o.id)}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 1,
                          textAlign: 'left',
                          font: 'inherit',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: o.id === selectedObsId ? 'primary.main' : 'divider',
                          borderRadius: 2,
                          p: 1.25,
                          bgcolor: o.id === selectedObsId ? '#edf5ff' : '#fff',
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {o.component}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {o.notes || sourceCodeFor(o.systemName)}
                          </Typography>
                        </Box>
                        <StatusChip label={status.label} tone={status.tone} />
                      </Box>
                    );
                  })}
                </Stack>
                <Alert severity="warning">
                  Observations inherit the full ASTM/{approvedContextLabel} code path from the Inspector. Each observation
                  maps to one deficiency record. Professional judgment is applied here — the framework structures decisions,
                  it does not replace engineering judgment.
                </Alert>
              </Box>

              <Box>
                <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
                  Deficiency Builder
                </Typography>
                {!selectedObs ? (
                  <Typography variant="body2" color="text.secondary">
                    Select an observation from the queue to begin.
                  </Typography>
                ) : (
                  <>
                    <Alert severity="success" sx={{ mb: 1.5 }}>
                      Source observation is fully coded and ready for analysis. Complete all 9 data categories before
                      approving.
                    </Alert>

                    <Typography variant="caption" sx={{ fontWeight: 800, color: legacyTokens.navy, display: 'block', mb: 0.5 }}>
                      Linked Evidence · {selectedObs.id}
                    </Typography>
                    {selectedObs.media.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        No evidence linked from the Inspector yet.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1, mb: 1.5 }}>
                        {selectedObs.media.map((m) => {
                          const Icon = MEDIA_TYPE_ICON[m.type];
                          const color = MEDIA_TILE_COLOR[m.type];
                          return (
                            <Box
                              key={m.id}
                              sx={{
                                position: 'relative',
                                bgcolor: color.bg,
                                color: color.fg,
                                borderRadius: 2,
                                p: 1,
                                pt: 2.5,
                                minHeight: 76,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  left: 4,
                                  fontWeight: 800,
                                  fontSize: 9,
                                  letterSpacing: '.04em',
                                  bgcolor: 'rgba(255,255,255,.22)',
                                  borderRadius: 1,
                                  px: 0.5,
                                  py: 0.1,
                                }}
                              >
                                {MEDIA_TYPE_PREFIX[m.type]}
                              </Typography>
                              <Icon sx={{ fontSize: 18, mb: 0.5, opacity: 0.9 }} />
                              <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }} noWrap>
                                {m.caption}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    <SectionedFormTable
                      sections={[
                        {
                          title: 'Inherited from Inspector',
                          rows: [
                            { label: 'Component', content: <Typography variant="body2">{selectedObs.component}</Typography> },
                            { label: 'System', content: <Typography variant="body2">{selectedObs.systemName}</Typography> },
                            {
                              label: 'Field Condition',
                              content: <StatusChip label={selectedObs.condition} tone={severityTone(defaultSeverity)} />,
                            },
                            { label: 'Source Code', content: <Typography variant="body2">{sourceCodeFor(selectedObs.systemName)}</Typography> },
                            {
                              label: 'Source Observation',
                              content: (
                                <Typography variant="body2">
                                  {selectedObs.id} · {selectedObs.notes || 'No field notes recorded.'}
                                </Typography>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Deficiency Classification · structured deficiency tracking',
                          rows: [
                            {
                              label: 'Deficiency Type',
                              content: (
                                <TextField select size="small" fullWidth value={deficiencyType} onChange={(e) => setDeficiencyType(e.target.value)}>
                                  {DEFICIENCY_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'Subcategory',
                              content: (
                                <TextField select size="small" fullWidth value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                                  {SUBCATEGORIES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Severity Assessment · risk prioritization',
                          rows: [
                            {
                              label: 'Severity',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={severity}
                                  onChange={(e) => setSeverity(e.target.value as DeficiencySeverity)}
                                >
                                  {SEVERITY_OPTIONS.map((s) => (
                                    <MenuItem key={s.value} value={s.value}>
                                      {s.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Severity Assessment — Risk Dimensions · what happens if not addressed?',
                          rows: [
                            {
                              label: 'Risk Type',
                              content: (
                                <TextField select size="small" fullWidth value={riskType} onChange={(e) => setRiskType(e.target.value)}>
                                  {RISK_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'Risk Level',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={riskLevel}
                                  onChange={(e) => setRiskLevel(e.target.value as DeficiencySeverity)}
                                >
                                  {RISK_LEVELS.map((r) => (
                                    <MenuItem key={r.value} value={r.value}>
                                      {r.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Code / Compliance Flags · risk and liability — Ontario Building Code',
                          rows: [
                            {
                              label: 'Code / Compliance Flag',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={codeComplianceFlag}
                                  onChange={(e) => setCodeComplianceFlag(e.target.value)}
                                >
                                  {CODE_COMPLIANCE_FLAGS.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Priority Classification · planning and budgeting',
                          rows: [
                            {
                              label: 'Priority',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={priorityTimeframe}
                                  onChange={(e) => setPriorityTimeframe(e.target.value)}
                                >
                                  {PRIORITY_TIMEFRAMES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Remaining Useful Life (RUL) · capital planning · ASTM lifecycle concepts',
                          rows: [
                            {
                              label: 'RUL Basis',
                              content: (
                                <TextField select size="small" fullWidth value={rulBasis} onChange={(e) => setRulBasis(e.target.value)}>
                                  {RUL_BASES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'RUL Status',
                              content: (
                                <TextField select size="small" fullWidth value={rulStatus} onChange={(e) => setRulStatus(e.target.value)}>
                                  {RUL_STATUSES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Failure Mechanism · root cause understanding',
                          rows: [
                            {
                              label: 'Failure Mechanism',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={failureMechanism}
                                  onChange={(e) => setFailureMechanism(e.target.value)}
                                >
                                  {FAILURE_MECHANISMS.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Recommendation Logic · action planning · engineering judgment',
                          rows: [
                            {
                              label: 'Recommendation Type',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={recommendationType}
                                  onChange={(e) => setRecommendationType(e.target.value)}
                                >
                                  {RECOMMENDATION_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'Recommendation Scope',
                              content: (
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={recommendationScope}
                                  onChange={(e) => setRecommendationScope(e.target.value)}
                                  placeholder="e.g. Targeted repairs near drain sump; include replacement in capital plan"
                                />
                              ),
                            },
                          ],
                        },
                        {
                          title: 'Cost Logic · capital planning · CIQS / RSMeans · full entry in Cost Analyst tab',
                          rows: [
                            {
                              label: 'Cost Trigger',
                              content: (
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={costTrigger}
                                  onChange={(e) => setCostTrigger(e.target.value)}
                                  placeholder="e.g. Repair allowance + replacement planning flag"
                                />
                              ),
                            },
                          ],
                        },
                      ]}
                    />

                    <Box sx={{ bgcolor: legacyTokens.navy, color: '#fff', px: 1.5, py: 0.75, mt: 2, borderRadius: '4px 4px 0 0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Narrative Development · client-facing reporting · PEO professional engineering standards
                      </Typography>
                    </Box>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: 0, borderRadius: '0 0 8px 8px', p: 1.5 }}>
                      <TextField
                        label="Deficiency Statement — technical record"
                        fullWidth
                        multiline
                        minRows={2}
                        value={deficiencyStatement}
                        onChange={(e) => setDeficiencyStatement(e.target.value)}
                        sx={{ mb: 1.5 }}
                      />
                      <TextField
                        label="Client-Facing Narrative — report language (PEO standards)"
                        fullWidth
                        multiline
                        minRows={2}
                        value={clientNarrative}
                        onChange={(e) => setClientNarrative(e.target.value)}
                        sx={{ mb: 1.5 }}
                      />
                      <TextField
                        label="Recommended Action"
                        fullWidth
                        multiline
                        minRows={2}
                        required
                        value={recommendedAction}
                        onChange={(e) => setRecommendedAction(e.target.value)}
                      />
                    </Box>

                  </>
                )}
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <Typography sx={sectionTitleSx}>
                    Finding Preview
                  </Typography>
                  {selectedObs && <StatusChip label="Live" tone="success" />}
                </Stack>
                {selectedObs && (
                  <Alert severity="info" sx={{ mb: 1.5 }}>
                    Updates as you fill in the Deficiency Builder. Shows what your decisions produce downstream.
                  </Alert>
                )}
                {selectedObs ? (
                  <>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 1.5, bgcolor: '#fbfcfe' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{lastCreated?.deficiencyId ?? 'DEF-DRAFT'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {sourceCodeFor(selectedObs.systemName)}
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Classification</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {deficiencyType.split(' — ')[0]}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Severity</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              <StatusChip label={severity} tone={severityTone(severity)} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Risk</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {riskType.split(' — ')[0]} · {riskLevel}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Failure Mechanism</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {failureMechanism.split(' — ')[0]}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Priority</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {priorityTimeframe.split(' — ')[0]}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>RUL</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {rulStatus.split(' — ')[0]}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: 0, pl: 0, color: 'text.secondary' }}>Recommendation</TableCell>
                            <TableCell sx={{ border: 0, pr: 0 }} align="right">
                              {recommendationType.split(' — ')[0]}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>

                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2, bgcolor: '#fbf8f2' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', mb: 1 }}>
                        Downstream Consequences
                      </Typography>
                      <Stack spacing={0.75}>
                        {(() => {
                          const peoRequired = severity === 'critical' || severity === 'high';
                          const hsFlagged = riskType === RISK_TYPES[0];
                          const regulatoryFlagged = codeComplianceFlag !== CODE_COMPLIANCE_FLAGS[0];
                          const rows: { label: string; tone: 'success' | 'warning' | 'error' | 'neutral'; desc: string }[] = [
                            {
                              label: peoRequired ? 'Required' : 'Not Required',
                              tone: peoRequired ? 'error' : 'success',
                              desc: `P.Eng. QA review — triggered by ${severity} severity`,
                            },
                            { label: hsFlagged ? 'Flagged' : 'Clear', tone: hsFlagged ? 'error' : 'success', desc: 'H&S review' },
                            {
                              label: regulatoryFlagged ? 'Flagged' : 'Clear',
                              tone: regulatoryFlagged ? 'error' : 'success',
                              desc: 'Regulatory review',
                            },
                            { label: 'Capital', tone: 'warning', desc: `Plan year: ${priorityTimeframe}` },
                            {
                              label: 'Budget',
                              tone: 'warning',
                              desc: `Capital repair allowance · ${formatCurrency(COST_ESTIMATE_BY_SEVERITY[severity])}`,
                            },
                            {
                              label: reserveFundEligible ? 'Eligible' : 'Not Eligible',
                              tone: reserveFundEligible ? 'success' : 'neutral',
                              desc: 'Reserve fund',
                            },
                            { label: 'Report', tone: 'neutral', desc: 'Deficiency Assessment + QA Review' },
                          ];
                          return rows.map((row) => (
                            <Stack key={row.desc} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <StatusChip label={row.label} tone={row.tone} />
                              <Typography variant="caption" color="text.secondary">
                                {row.desc}
                              </Typography>
                            </Stack>
                          ));
                        })()}
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No finding selected.
                  </Typography>
                )}

                {selectedObs && (
                  <>
                    <TextField
                      label={
                        <>
                          Reason for Deviation from Default{' '}
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                            — required if RUL, cost, or unit basis differs from Excel defaults
                          </Box>
                        </>
                      }
                      placeholder="e.g. RUL reduced from 5-yr default to 2-yr based on observed seam failure pattern and drain sump loading…"
                      fullWidth
                      multiline
                      minRows={2}
                      value={deviationReason}
                      onChange={(e) => setDeviationReason(e.target.value)}
                      required={isDeviated}
                      sx={{ mb: 2 }}
                    />

                    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveDeficiency}
                        disabled={
                          !recommendedAction.trim() ||
                          (isDeviated && !deviationReason.trim()) ||
                          createDeficiency.isPending ||
                          !canApprove
                        }
                      >
                        Approve for Report
                      </Button>
                      <Button variant="outlined" onClick={() => toast('Sent back to Inspector for coding or evidence correction.')}>
                        Send Back to Inspector
                      </Button>
                    </Stack>
                    {!canApprove && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        You don&apos;t have Approve permission. Ask an administrator to grant it in
                        Administration → Employees.
                      </Typography>
                    )}
                  </>
                )}

                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Traceability Chain
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Stage</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Record</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Observation</TableCell>
                      <TableCell>{selectedObsId ?? '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Deficiency</TableCell>
                      <TableCell>{lastCreated?.deficiencyId ?? 'Pending approval'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Finding</TableCell>
                      <TableCell>Pending approval</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Capital Plan Row</TableCell>
                      <TableCell>{lastCostEntry ? `${lastCostEntry.id} · Funded` : 'Pending'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>
          )}

          {roleTab === 'cost' && (
            <Stack spacing={2.5}>
              <Box sx={costPanelSx}>
                <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
                  Cost Logic
                </Typography>
                {!selectedObs ? (
                  <Typography variant="body2" color="text.secondary">
                    Select an observation on the Building Science Analyst tab first.
                  </Typography>
                ) : (
                  <>
                    <Alert severity="success" sx={{ mb: 1.5 }}>
                      Quantity is inherited from the Inspector record. Enter unit rate and planning assumptions.
                    </Alert>
                    <SectionedFormTable
                      sections={[
                        {
                          title: 'Deficiency Reference',
                          rows: [
                            { label: 'Deficiency', content: <Typography variant="body2">{lastCreated?.deficiencyId ?? 'DEF-ROOF-023'} · {selectedObs.component}</Typography> },
                            { label: 'ASTM/BCA', content: <Typography variant="body2">{selectedObs.systemName === 'Roofing' ? 'B3010.10.02 · Lap Seams' : sourceCodeFor(selectedObs.systemName)}</Typography> },
                            { label: 'Priority', content: <StatusChip label={priorityTimeframe} tone={severityTone(severity)} /> },
                          ],
                        },
                        {
                          title: 'Cost Inputs',
                          rows: [
                            {
                              label: 'Quantity (from Inspector)',
                              content: <Typography variant="body2">{quantity > 0 ? `${quantity} ${quantityUnit}` : 'Not recorded'}</Typography>,
                            },
                            {
                              label: 'Unit Rate',
                              content: (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={unitRate}
                                  onChange={(e) => setUnitRate(Number(e.target.value))}
                                  sx={{ width: 110 }}
                                />
                              ),
                            },
                            { label: 'Base Cost', content: <Typography sx={{ fontWeight: 800 }}>{formatCurrency(baseCost)}</Typography> },
                            {
                              label: 'Escalation %',
                              content: (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={escalationPct}
                                  onChange={(e) => setEscalationPct(Number(e.target.value))}
                                  sx={{ width: 90 }}
                                />
                              ),
                            },
                            {
                              label: 'Contingency %',
                              content: (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={contingencyPct}
                                  onChange={(e) => setContingencyPct(Number(e.target.value))}
                                  sx={{ width: 90 }}
                                />
                              ),
                            },
                            {
                              label: 'Soft Costs %',
                              content: (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={softCostsPct}
                                  onChange={(e) => setSoftCostsPct(Number(e.target.value))}
                                  sx={{ width: 90 }}
                                />
                              ),
                            },
                            {
                              label: 'Total Allowance',
                              content: <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{formatCurrency(totalAllowance)}</Typography>,
                            },
                          ],
                        },
                        {
                          title: 'Planning',
                          rows: [
                            {
                              label: 'Phasing / Year',
                              content: (
                                <TextField select size="small" fullWidth value={phasingLabel} onChange={(e) => setPhasingLabel(e.target.value)}>
                                  {PHASING_OPTIONS.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'Reserve Fund Eligible',
                              content: (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={reserveFundEligible ? 'yes' : 'no'}
                                  onChange={(e) => setReserveFundEligible(e.target.value === 'yes')}
                                >
                                  <MenuItem value="yes">Yes — capital renewal item</MenuItem>
                                  <MenuItem value="no">No — operating / maintenance</MenuItem>
                                </TextField>
                              ),
                            },
                            {
                              label: 'Rate Source',
                              content: (
                                <TextField select size="small" fullWidth value={rateSource} onChange={(e) => setRateSource(e.target.value)}>
                                  {RATE_SOURCES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ),
                            },
                            {
                              label: 'Reason / Notes',
                              content: (
                                <TextField
                                  size="small"
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  value={costNotes}
                                  onChange={(e) => setCostNotes(e.target.value)}
                                />
                              ),
                            },
                          ],
                        },
                      ]}
                    />
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveCostEntry}
                        disabled={createCapitalPlanItem.isPending || !canApprove}
                      >
                        Approve Cost Entry
                      </Button>
                      <Button variant="outlined" onClick={() => toast('Cost entry sent back to Building Science Analyst for review.')}>
                        Send Back to BSA
                      </Button>
                    </Stack>
                  </>
                )}
              </Box>

              <Box sx={costPanelSx}>
                <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
                  Capital Plan Schedule
                </Typography>
                <Alert severity="success" sx={{ mb: 1.5 }}>
                  Approved cost entries populate the capital plan automatically. One row per approved deficiency.
                </Alert>
                <DataTable
                  columns={[
                    { field: 'systemName', headerName: 'System', width: 150 },
                    { field: 'recommendedWork', headerName: 'Recommended Work', flex: 1, minWidth: 160 },
                    {
                      field: 'priority',
                      headerName: 'Priority',
                      width: 110,
                      renderCell: (params) => <StatusChip label={String(params.value)} tone={severityTone(params.value as DeficiencySeverity)} />,
                    },
                    { field: 'year', headerName: 'Year', width: 80, type: 'number' },
                    { field: 'forecastCostFormatted', headerName: 'Allowance', width: 110 },
                  ]}
                  rows={buildingCapitalPlan}
                  height={320}
                />

                <Typography sx={{ ...subsectionTitleSx, mt: 2, mb: 1 }}>
                  5-Year Planning Summary
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Horizon</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Immediate ({PLANNING_HORIZON_YEARS.immediateMax})</TableCell>
                      <TableCell align="right">{formatCurrency(horizons.immediate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Short-Term ({PLANNING_HORIZON_YEARS.immediateMax + 1}–{PLANNING_HORIZON_YEARS.shortTermMax})
                      </TableCell>
                      <TableCell align="right">{formatCurrency(horizons.shortTerm)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Medium-Term ({PLANNING_HORIZON_YEARS.shortTermMax + 1}–{PLANNING_HORIZON_YEARS.mediumTermMax})
                      </TableCell>
                      <TableCell align="right">{formatCurrency(horizons.mediumTerm)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>5-Year Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {formatCurrency(horizons.fiveYearTotal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Reserve Fund Eligible</TableCell>
                      <TableCell align="right">{formatCurrency(horizons.reserveFundTotal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, boxShadow: 'none', '&:hover': { bgcolor: legacyTokens.blueSoft, boxShadow: 'none' } }}
                    onClick={() => toast('Capital plan exported to Excel — one row per approved deficiency.')}
                  >
                    Export to Excel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, boxShadow: 'none', '&:hover': { bgcolor: legacyTokens.blueSoft, boxShadow: 'none' } }}
                    onClick={() => toast('Reserve fund schedule generated from eligible approved capital rows.')}
                  >
                    Generate Reserve Fund Schedule
                  </Button>
                </Stack>
              </Box>

              <Box sx={costPanelSx}>
                <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
                  Cost Standards Reference
                </Typography>
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  Unit rates are sourced from CIQS, RSMeans, and the internal cost library. Escalation is applied per
                  project assumptions. All deviations require a reason on record.
                </Alert>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Used For</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {COST_STANDARDS_REFERENCE.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell>{row.source}</TableCell>
                        <TableCell>{row.usedFor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography sx={{ ...subsectionTitleSx, mt: 2, mb: 1 }}>
                  Cost Traceability
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Stage</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Record</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Inspector observation</TableCell>
                      <TableCell>{selectedObs?.id ?? 'OBS-ROOF-023'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Deficiency (BSA)</TableCell>
                      <TableCell>{lastCreated?.deficiencyId ?? 'DEF-ROOF-023'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cost entry</TableCell>
                      <TableCell>{lastCostEntry?.id ?? 'COST-ROOF-023'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Report finding</TableCell>
                      <TableCell>FIND-ROOF-023</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Capital plan row</TableCell>
                      <TableCell>{lastCostEntry?.id ?? 'CAP-2026-B3010'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          )}

          {roleTab === 'reserve' && (
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Typography sx={{ ...sectionTitleSx }}>
                  Asset &amp; Component Inventory
                </Typography>
                <StatusChip label="Partially Active" tone="neutral" />
              </Stack>
              <Alert severity="info" sx={{ mb: 1.5 }}>
                Reserve Fund fields (Expected Useful Life, Effective Age, Remaining Useful Life, Current
                Replacement Cost, Future Replacement Timing, Inflation Assumption, and Lifecycle Expenditure
                Records) are supporting capital-planning data for this BCA/Envelope report — not a full
                Reserve Fund Study.
              </Alert>
              <DataTable
                columns={[
                  { field: 'component', headerName: 'Component', flex: 1, minWidth: 160 },
                  { field: 'systemName', headerName: 'System', flex: 1, minWidth: 160 },
                  {
                    field: 'condition',
                    headerName: 'Condition',
                    width: 110,
                    renderCell: (params) => <StatusChip label={String(params.value)} tone={conditionTone(params.value as Condition)} />,
                  },
                  {
                    field: 'riskLevel',
                    headerName: 'Risk',
                    width: 100,
                    renderCell: (params) => <StatusChip label={String(params.value)} tone={riskTone(params.value as 'low' | 'medium' | 'high')} />,
                  },
                  { field: 'remainingUsefulLifeYears', headerName: 'RUL (yrs)', width: 100, type: 'number' },
                  { field: 'expectedUsefulLifeYears', headerName: 'EUL (yrs)', width: 100, type: 'number' },
                  { field: 'futureReplacementYear', headerName: 'Replacement Year', width: 140, type: 'number' },
                ]}
                rows={inventoryAssetQuery.data?.rows ?? []}
                loading={inventoryAssetQuery.isLoading}
                height={420}
                onRowClick={(row) => setSelectedInventoryAssetId(row.id)}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <DetailDrawer
        open={Boolean(selectedInventoryAsset)}
        onClose={() => setSelectedInventoryAssetId(null)}
        title={selectedInventoryAsset?.id ?? ''}
        subtitle={selectedInventoryAsset?.component}
      >
        {selectedInventoryAsset && (
          <AssetDetailPanel
            asset={selectedInventoryAsset}
            buildingName={building?.name ?? ''}
            editable={permissions.includes('edit') && canEdit}
          />
        )}
      </DetailDrawer>
    </Box>
    </StepAccessGate>
  );
}
