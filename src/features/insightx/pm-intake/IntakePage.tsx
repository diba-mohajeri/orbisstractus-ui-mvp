import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import SectionedFormTable from '../../../shared/components/SectionedFormTable';
import { useToast } from '../../../shared/store/toastStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import {
  SCOPE_STATUS_LABEL,
  useIntakeGovernanceStore,
  type SystemScopeStatus,
} from '../../../shared/store/intakeGovernanceStore';
import {
  useAssetRecords,
  useBuildingSummaries,
  useBuildingSystems,
  useProjects,
  useRegionSummaries,
} from '../../client-portal/api';
import {
  SCOPE_METHOD_BY_SYSTEM,
  SYSTEM_NAME_BY_UNIFORMAT_L2,
  UNIFORMAT_CODE_BY_SYSTEM,
  UNIFORMAT_TREE,
  type UniformatNode,
} from './uniformatTree';
import UniformatTreeRow, { nodeMatchesQuery } from './UniformatTreeRow';
import {
  BCA_CATEGORY_BY_CODE,
  CATEGORY_LABEL,
  ENVELOPE_CATEGORY_BY_CODE,
  type UniformatScopeCategory,
} from './uniformatContextConfig';
import { ASSESSMENT_SCOPE_BY_CONTEXT, type AssessmentScopeConfig } from './assessmentScope';
import { heroCardContentSx, navyButtonSx, pageTitleSx, sectionTitleSx, softBlueButtonSx, subsectionTitleSx } from '../shared/pageStyles';
import { useStepAccess } from '../shared/useMyProjectAccess';
import StepAccessGate from '../shared/StepAccessGate';
import NewAssessmentModal from './NewAssessmentModal';
import { legacyTokens } from '../../../theme/theme';
import { ENVELOPE_APPROVED_SCOPE } from '../shared/approvedScope';
import ScopeStatusRow from '../shared/ScopeStatusRow';

type ReadinessStatus = 'complete' | 'partial' | 'notReceived' | 'notStarted';
type DocumentStatus = 'received' | 'partial' | 'outstanding';

const READINESS_STATUS_TONE: Record<ReadinessStatus, StatusTone> = {
  complete: 'success',
  partial: 'warning',
  notReceived: 'error',
  notStarted: 'neutral',
};

const READINESS_STATUS_LABEL: Record<ReadinessStatus, string> = {
  complete: 'Complete',
  partial: 'Partial',
  notReceived: 'Not Received',
  notStarted: 'Not Started',
};

const DOCUMENT_STATUS_TONE: Record<DocumentStatus, StatusTone> = {
  received: 'success',
  partial: 'warning',
  outstanding: 'error',
};

const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  received: 'Received',
  partial: 'Partial',
  outstanding: 'Outstanding',
};

interface OperationalContextOption {
  key: string;
  label: string;
  sub: string;
  status: 'active' | 'partial' | 'planned';
}

const OPERATIONAL_CONTEXTS: OperationalContextOption[] = [
  { key: 'full', label: 'Full Taxonomy', sub: 'Browse the complete Uniformat classification, Levels A through H', status: 'active' },
  { key: 'bca', label: 'BCA', sub: 'General condition assessment workflow', status: 'active' },
  { key: 'envelope', label: 'Building Envelope', sub: 'Roofing, facade, thermal, moisture workflows', status: 'active' },
  { key: 'reserve', label: 'Reserve Fund', sub: 'EUL, RUL, replacement timing, and lifecycle costing — in Analyst → Asset & Component Inventory', status: 'partial' },
  { key: 'remediation', label: 'Remediation', sub: 'Execution and contractor coordination', status: 'planned' },
  { key: 'qa-governance', label: 'QA Governance', sub: 'Audit and defensibility workflows', status: 'planned' },
  { key: 'asset-mgmt', label: 'Asset Management', sub: 'Portfolio analytics and asset intelligence', status: 'planned' },
];

interface ReadinessItem {
  label: string;
  sub: string;
  status: ReadinessStatus;
}

const INITIAL_READINESS: ReadinessItem[] = [
  {
    label: 'Client details & building profile',
    sub: 'Client name, contact, purpose, address, occupancy, GFA, and structural type confirmed.',
    status: 'complete',
  },
  {
    label: 'Assessment scope defined',
    sub: 'Systems in scope selected. Exclusions documented in the Scope Matrix.',
    status: 'complete',
  },
  {
    label: 'ASTM/Uniformat code set locked',
    sub: 'Scope package sent to the Inspector field library.',
    status: 'complete',
  },
  {
    label: 'As-built drawings received',
    sub: 'Architectural and structural drawings on file. Mechanical as-builts may still be outstanding.',
    status: 'partial',
  },
  {
    label: 'Prior BCA or condition reports',
    sub: 'Baseline comparison document, if one exists on file.',
    status: 'notReceived',
  },
  {
    label: 'Maintenance logs collected',
    sub: 'Recent HVAC, elevator, and equipment maintenance records.',
    status: 'partial',
  },
  {
    label: 'Site visit scheduled & access confirmed',
    sub: 'Date, time, and on-site superintendent contact confirmed.',
    status: 'complete',
  },
  {
    label: 'Inspector assigned & briefed',
    sub: 'Scope briefing and known-issue list shared with the field team.',
    status: 'complete',
  },
  {
    label: 'Roof access & fall protection confirmed',
    sub: 'Access route and anchor point certification checked.',
    status: 'partial',
  },
];

interface IntakeDocument {
  name: string;
  requiredFor: string;
}

const INTAKE_DOCUMENTS: IntakeDocument[] = [
  { name: 'Architectural As-Builts', requiredFor: 'Building description, scope definition' },
  { name: 'Structural As-Builts', requiredFor: 'Structural review' },
  { name: 'Mechanical As-Builts', requiredFor: 'HVAC & plumbing review' },
  { name: 'Electrical Single-Line Diagram', requiredFor: 'Electrical review' },
  { name: 'Prior BCA / Condition Report', requiredFor: 'Baseline comparison' },
  { name: 'Roof Warranty / Repair Records', requiredFor: 'Roof system review' },
  { name: 'HVAC Maintenance Logs', requiredFor: 'Mechanical review' },
  { name: 'Elevator Maintenance Records', requiredFor: 'Equipment review' },
  { name: 'Fire Inspection Certificates', requiredFor: 'Fire / life safety' },
  { name: 'Building Permits (Recent Renovations)', requiredFor: 'Code compliance' },
  { name: 'Insurance Claims History', requiredFor: 'Risk history' },
  { name: 'Energy Audit (if any)', requiredFor: 'Context only' },
];

const INITIAL_DOCUMENT_STATUS: DocumentStatus[] = INTAKE_DOCUMENTS.map((_, i) =>
  i % 3 === 0 ? 'outstanding' : i % 3 === 1 ? 'partial' : 'received',
);

const CATEGORY_TONE: Record<UniformatScopeCategory, StatusTone> = {
  core: 'success',
  selective: 'warning',
  admin: 'neutral',
  none: 'neutral',
};

interface FullScopeRow {
  code: string;
  system: string;
  statusKey: string;
  defaultStatus: SystemScopeStatus;
  method: string;
  notes: string;
}

const FULL_SCOPE_MATRIX: FullScopeRow[] = [
  { code: 'A10', system: 'Foundations', statusKey: 'Foundations', defaultStatus: 'inScope', method: 'Visual from accessible areas', notes: 'P2 slab condition flagged by owner.' },
  { code: 'B10', system: 'Superstructure', statusKey: 'Structure', defaultStatus: 'inScope', method: 'Visual', notes: 'Concrete frame — check for cracking and spalls.' },
  { code: 'B20', system: 'Exterior Enclosure', statusKey: 'Building Envelope', defaultStatus: 'inScope', method: 'Visual + thermal imaging', notes: 'Brick veneer + curtain wall — review transitions.' },
  { code: 'B30', system: 'Roofing', statusKey: 'Roofing', defaultStatus: 'inScope', method: 'Visual + moisture probe', notes: 'Access via roof hatch — anchors to be confirmed.' },
  { code: 'C10', system: 'Interior Construction', statusKey: 'Interior Construction', defaultStatus: 'inScope', method: 'Visual — common areas only', notes: 'Occupied suites excluded per client direction.' },
  { code: 'C20', system: 'Stairs', statusKey: 'Stairs', defaultStatus: 'inScope', method: 'Visual', notes: 'All stairwells.' },
  { code: 'C30', system: 'Interior Finishes', statusKey: 'Interior Finishes', defaultStatus: 'limited', method: 'Visual — lobby & common only', notes: 'Tenant spaces excluded.' },
  { code: 'D10', system: 'Conveying (Elevators)', statusKey: 'Conveying', defaultStatus: 'inScope', method: 'Document review + visual', notes: 'Maintenance records received.' },
  { code: 'D20', system: 'Plumbing', statusKey: 'Plumbing', defaultStatus: 'inScope', method: 'Visual + interview', notes: 'Interview building superintendent regarding leaks.' },
  { code: 'D30', system: 'HVAC', statusKey: 'Mechanical (HVAC)', defaultStatus: 'inScope', method: 'Visual + document review', notes: 'Mechanical as-builts outstanding.' },
  { code: 'D40', system: 'Fire Protection', statusKey: 'Fire & Life Safety', defaultStatus: 'inScope', method: 'Visual + certificate review', notes: 'Certificate current to December 2026.' },
  { code: 'D50', system: 'Electrical', statusKey: 'Electrical', defaultStatus: 'inScope', method: 'Visual + single-line review', notes: 'Panel rooms accessible.' },
  { code: 'E10', system: 'Equipment & Furnishings', statusKey: 'Equipment & Furnishings', defaultStatus: 'excluded', method: '—', notes: 'Not in BCA scope per client.' },
  { code: 'G10', system: 'Site – Paving & Walks', statusKey: 'Site & Civil', defaultStatus: 'inScope', method: 'Visual', notes: 'Parking lot, sidewalks, and accessible routes.' },
  { code: 'G20', system: 'Site – Landscaping', statusKey: 'Site Landscaping', defaultStatus: 'excluded', method: '—', notes: 'Not relevant to BCA.' },
  { code: 'G40', system: 'Site – Electrical & Lighting', statusKey: 'Site Electrical & Lighting', defaultStatus: 'inScope', method: 'Visual', notes: 'Parking lot lighting and exterior fixtures.' },
];

const INITIAL_SCOPE_METHODS = Object.fromEntries(FULL_SCOPE_MATRIX.map((row) => [row.code, row.method]));
const INITIAL_SCOPE_NOTES = Object.fromEntries(FULL_SCOPE_MATRIX.map((row) => [row.code, row.notes]));

const INSPECTOR_BRIEFING_NOTES = [
  'Execute the field review against the approved ASTM/Uniformat scope package; do not add excluded systems without PM authorization.',
  'Prioritize the roof membrane, lap seams, exterior wall transitions, perimeter sealants, and owner-identified condition concerns.',
  'Capture clear overview and detail photos for every observation, including location, condition, L1–L5 classification, and accessibility limitations.',
  'Confirm roof access and fall-protection requirements with the site superintendent before beginning elevated work.',
];

// Prunes nodes classified 'none' for the given context's configuration, unless a descendant survives
// (kept as a pass-through ancestor so that still-relevant deep items, e.g. a 'selective' leaf under a
// 'none' branch, remain reachable) — matches the real BCA/Envelope configuration workbook's intent.
function filterTreeByCategory(nodes: UniformatNode[], categoryByCode: Record<string, UniformatScopeCategory>): UniformatNode[] {
  const result: UniformatNode[] = [];
  for (const node of nodes) {
    const children = node.children ? filterTreeByCategory(node.children, categoryByCode) : undefined;
    const ownCategory = categoryByCode[node.code];
    const visible = ownCategory !== 'none' || Boolean(children && children.length > 0);
    if (visible) {
      result.push(children ? { ...node, children } : node);
    }
  }
  return result;
}

export default function IntakePage() {
  const useCompactScopeMatrix = import.meta.env.VITE_COMPACT_SCOPE_MATRIX === 'true';
  const toast = useToast();
  const permissions = useAuthStore((s) => s.session?.user.permissions) ?? [];
  const canApprove = permissions.includes('approve');
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const { data: projects } = useProjects();
  const { data: buildings } = useBuildingSummaries();
  const { data: regions } = useRegionSummaries();

  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  const { level: stepAccessLevel, isLoading: accessLoading, canEdit } = useStepAccess(currentProject?.id, 'intake');
  const building = buildings?.find((b) => b.id === currentProject?.buildingId);
  const region = regions?.find((r) => r.id === building?.regionId);

  const { data: systems } = useBuildingSystems(currentProject?.buildingId ?? null);
  const assetQuery = useAssetRecords({ buildingId: currentProject?.buildingId, page: 0, pageSize: 200 });
  const knownConcerns = (assetQuery.data?.rows ?? []).filter((r) => r.condition === 'poor' || r.condition === 'critical').slice(0, 3);

  const intakeState = useIntakeGovernanceStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const setSystemScopeStatus = useIntakeGovernanceStore((s) => s.setSystemScopeStatus);
  const approveScope = useIntakeGovernanceStore((s) => s.approveScope);
  const setReadinessComplete = useIntakeGovernanceStore((s) => s.setReadinessComplete);
  const setReadinessPct = useIntakeGovernanceStore((s) => s.setReadinessPct);
  const setApprovedOperationalContext = useIntakeGovernanceStore((s) => s.setApprovedOperationalContext);

  const [operationalContext, setOperationalContext] = useState('bca');
  const [tab, setTab] = useState<'readiness' | 'documents' | 'scope' | 'handoff'>('readiness');
  const [readiness, setReadiness] = useState<ReadinessItem[]>(INITIAL_READINESS);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus[]>(INITIAL_DOCUMENT_STATUS);
  const [scopeMethods, setScopeMethods] = useState<Record<string, string>>(INITIAL_SCOPE_METHODS);
  const [scopeNotes, setScopeNotes] = useState<Record<string, string>>(INITIAL_SCOPE_NOTES);
  const [navigatorQuery, setNavigatorQuery] = useState('');
  const [expandedUniformatCodes, setExpandedUniformatCodes] = useState<Set<string>>(new Set());
  const [selectedUniformatNode, setSelectedUniformatNode] = useState<UniformatNode | null>(null);
  const [newAssessmentOpen, setNewAssessmentOpen] = useState(false);

  function toggleUniformatCode(code: string) {
    setExpandedUniformatCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const readinessCompleteCount = readiness.filter((r) => r.status === 'complete').length;
  const readinessPct = Math.round((readinessCompleteCount / readiness.length) * 100);
  const readinessAllComplete = readinessCompleteCount === readiness.length;
  const openItems = readiness.filter((r) => r.status === 'notReceived');
  const documentsReceivedCount = documentStatus.filter((s) => s === 'received').length;

  useEffect(() => {
    if (!currentProject) return;
    setReadinessComplete(currentProject.id, readinessAllComplete);
    setReadinessPct(currentProject.id, readinessPct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, readinessAllComplete, readinessPct]);

  function updateReadiness(index: number, status: ReadinessStatus) {
    setReadiness((prev) => prev.map((r, i) => (i === index ? { ...r, status } : r)));
  }

  function uploadDocument(index: number, name: string) {
    setDocumentStatus((prev) => prev.map((s, i) => (i === index ? 'received' : s)));
    toast(`${name} received.`);
  }

  const canConfirmHandoff = Boolean(currentProject) && readinessAllComplete && intakeState.scopeApproved && canEdit;

  const scopeStatusFor = (systemName: string): SystemScopeStatus => intakeState.systemScopeStatus[systemName] ?? 'inScope';
  const inScopeCount = (systems ?? []).filter((s) => scopeStatusFor(s.systemName) === 'inScope').length;
  const limitedCount = (systems ?? []).filter((s) => scopeStatusFor(s.systemName) === 'limited').length;
  const excludedSystems = (systems ?? []).filter((s) => scopeStatusFor(s.systemName) === 'excluded');
  const assessmentScope: AssessmentScopeConfig | null =
    ASSESSMENT_SCOPE_BY_CONTEXT[operationalContext as 'bca' | 'envelope'] ?? null;

  const navigatorQueryNormalized = navigatorQuery.trim().toLowerCase();
  const navigatorCategoryMap: Record<string, UniformatScopeCategory> | null =
    operationalContext === 'bca' ? BCA_CATEGORY_BY_CODE : operationalContext === 'envelope' ? ENVELOPE_CATEGORY_BY_CODE : null;
  const navigatorTree: UniformatNode[] = navigatorCategoryMap ? filterTreeByCategory(UNIFORMAT_TREE, navigatorCategoryMap) : UNIFORMAT_TREE;

  function categoryBadgeForUniformatCode(code: string) {
    if (!navigatorCategoryMap) return null;
    const category = navigatorCategoryMap[code];
    if (!category) return null;
    return <StatusChip label={CATEGORY_LABEL[category]} tone={CATEGORY_TONE[category]} />;
  }

  // L2 codes that map to one of our canonical building systems stay in sync with the Scope Matrix tab
  // (keyed by system name there); every other node in the tree gets its own independent status, keyed
  // by its own Uniformat code.
  function statusKeyForUniformatCode(code: string): string {
    return SYSTEM_NAME_BY_UNIFORMAT_L2[code] ?? code;
  }

  if (!currentProject || !building) {
    return <Typography color="text.secondary">Loading project…</Typography>;
  }

  const heroKpis: KpiTileData[] = [
    { label: 'Intake Readiness', value: `${readinessPct}%`, tone: readinessPct === 100 ? 'success' : 'neutral' },
    { label: 'Open Items', value: String(openItems.length), tone: openItems.length > 0 ? 'error' : 'success' },
    { label: 'Documents Received', value: `${documentsReceivedCount}/${INTAKE_DOCUMENTS.length}`, tone: 'neutral' },
    { label: 'Site Visit Date', value: currentProject.siteVisitDate, tone: 'neutral' },
  ];

  return (
    <StepAccessGate level={stepAccessLevel} stepLabel="PM / Intake" isLoading={accessLoading}>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={heroCardContentSx}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography component="h1" sx={pageTitleSx}>PM / Intake · ASTM Governance &amp; Scope Definition</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
                Govern the engagement before inspection begins: select operational context, define ASTM
                scope, confirm exclusions, set evidence requirements, generate the approved scope package,
                and control workbook/report strategy. The Inspector executes against this approved scope.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button variant="contained" sx={navyButtonSx} onClick={() => setNewAssessmentOpen(true)}>
                + New Assessment
              </Button>
              <Button variant="contained" sx={softBlueButtonSx} onClick={() => toast(`Readiness check: ${readinessPct}% complete.`)}>
                Run Readiness Check
              </Button>
              <Button variant="contained" sx={softBlueButtonSx} onClick={openTechnicalDrawer}>
                Open Technical Detail
              </Button>
            </Stack>
          </Box>
          <KpiStrip items={heroKpis} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
            ASTM Governance &amp; Scope Definition
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>PM governs → Inspector executes.</strong> The PM / Intake role defines the ASTM
            backbone, operational context, in-scope systems, exclusions, evidence requirements, and
            workbook/report strategy before the field team starts inspection.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>
              1. Operational Context
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Select the active service context. This filters the ASTM tree, inspection checklist, analysis
              workflow, report package, and workbook generation.
            </Typography>
            <Stack spacing={1}>
              {OPERATIONAL_CONTEXTS.map((ctx) => (
                <Box
                  key={ctx.key}
                  onClick={() => {
                    if (ctx.status === 'partial') {
                      toast(`${ctx.label} data is partially active — see Analyst → Asset & Component Inventory for this project. Full Reserve Fund Study workflows are coming in a future phase.`);
                      return;
                    }
                    if (ctx.status !== 'active') {
                      toast(`${ctx.label} operational context is coming in a future phase.`);
                      return;
                    }
                    setOperationalContext(ctx.key);
                    if (ctx.key === 'bca' || ctx.key === 'envelope') {
                      setApprovedOperationalContext(currentProject.id, ctx.key);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: operationalContext === ctx.key ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 1.25,
                    opacity: ctx.status === 'planned' ? 0.75 : 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ctx.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ctx.sub}
                    </Typography>
                  </Box>
                  <StatusChip
                    label={ctx.status === 'active' ? 'Active' : ctx.status === 'partial' ? 'Partially Active' : 'Planned'}
                    tone={ctx.status === 'active' ? 'success' : ctx.status === 'partial' ? 'warning' : 'neutral'}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              2. ASTM System Navigator
            </Typography>
            <Alert severity="info" sx={{ mb: 1.5, fontSize: 13 }}>
              <strong>PM Scope Selection Controls:</strong> items shown here are filtered to the selected
              operational context's standard configuration (Core/Selective/Admin badges reflect ABSI's
              default BCA and Building Envelope profiles — choose Full Taxonomy to browse everything).
              Expand a branch to drill into its Uniformat levels, and mark each item In Scope, Limited,
              Excluded, or Optional / Review using the dropdown on its row.
            </Alert>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search system or code…"
                value={navigatorQuery}
                onChange={(e) => setNavigatorQuery(e.target.value)}
              />
              <Button size="small" variant="outlined" onClick={() => toast('AI-suggested codes shown.')}>
                AI Suggest
              </Button>
            </Stack>
            <Tabs
              value={0}
              onChange={(_, v) => {
                if (v !== 0) toast('Additional views ship in a future phase.');
              }}
              sx={{ mb: 1, minHeight: 32 }}
            >
              <Tab label="All Systems" sx={{ minHeight: 32 }} />
              <Tab label="Recent" sx={{ minHeight: 32 }} />
              <Tab label="AI Suggested" sx={{ minHeight: 32 }} />
            </Tabs>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 400, overflowY: 'auto' }}>
              {navigatorTree.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                  No systems available for this operational context.
                </Typography>
              )}
              {navigatorTree.map((l1) => {
                if (navigatorQueryNormalized && !nodeMatchesQuery(l1, navigatorQueryNormalized)) return null;
                return (
                  <UniformatTreeRow
                    key={l1.code}
                    node={l1}
                    depth={0}
                    query={navigatorQueryNormalized}
                    expandedCodes={expandedUniformatCodes}
                    selectedCode={selectedUniformatNode?.code ?? null}
                    onToggle={toggleUniformatCode}
                    onSelect={setSelectedUniformatNode}
                    getStatus={(code) => scopeStatusFor(statusKeyForUniformatCode(code))}
                    onStatusChange={(code, status) => setSystemScopeStatus(currentProject.id, statusKeyForUniformatCode(code), status)}
                    getCategoryBadge={categoryBadgeForUniformatCode}
                  />
                );
              })}
            </Box>
            {selectedUniformatNode && (
              <Alert severity="success" sx={{ mt: 1.5 }}>
                Selected: <strong>{selectedUniformatNode.code}</strong> · {selectedUniformatNode.title}
              </Alert>
            )}
            <Button variant="contained" color="success" fullWidth sx={{ mt: 1.5 }} onClick={() => setTab('scope')}>
              Apply to Scope Matrix / Approve Scope Package
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              3. Governance Package
            </Typography>

            {assessmentScope ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  {assessmentScope.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {assessmentScope.description}
                </Typography>
                <Stack spacing={1} sx={{ mb: 1.5, maxHeight: 260, overflowY: 'auto' }}>
                  {assessmentScope.cards.map((c) => (
                    <Box
                      key={c.name}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.description}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={c.status}
                        tone={c.status === 'In Scope' || c.status === 'Required' ? 'success' : 'warning'}
                      />
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Select the BCA or Building Envelope operational context to generate its standard
                assessment scope package.
              </Typography>
            )}

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Evidence Requirements
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              {assessmentScope?.evidence ??
                'Photos, condition ratings, lifecycle observations, and selective drone/thermal evidence where authorized.'}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Workbook / Report Strategy
            </Typography>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              <Button
                size="small"
                variant={operationalContext === 'bca' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => toast('BCA engineering workbook generated.')}
              >
                Generate BCA Engineering Workbook
              </Button>
              <Button
                size="small"
                variant={operationalContext === 'envelope' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => toast('Envelope workbook generated.')}
              >
                Generate Envelope Workbook
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Workbook and report outputs inherit the selected operational context and approved ASTM scope.
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Exclusions / Limitations
            </Typography>
            <Alert severity={excludedSystems.length > 0 ? 'warning' : 'info'} sx={{ fontSize: 13 }}>
              {excludedSystems.length > 0
                ? `Excluded from scope: ${excludedSystems.map((s) => s.systemName).join(', ')}. Access constraints will be carried into report limitations.`
                : 'Occupied suites excluded unless specifically authorized. Concealed conditions excluded unless opened for review. Access constraints will be carried into report limitations.'}
            </Alert>
          </CardContent>
        </Card>
      </Box>

      {intakeState.scopeApproved && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
              Approved Scope Package
            </Typography>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              This package is generated by PM / Intake and inherited by the Inspector. Field users collect
              evidence against this approved scope; they do not redefine engagement scope.
            </Alert>
            <Typography variant="body2">
              {building.name} — {inScopeCount} systems in scope, {limitedCount} limited, {excludedSystems.length}{' '}
              excluded. Uniformat scope package locked for {currentProject.serviceLine} assessment.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
            <SectionedFormTable
              sections={[
                {
                  title: 'Client',
                  rows: [
                    { label: 'Organization', content: <Typography variant="body2" sx={{ fontWeight: 700 }}>{building.clientOrganization}</Typography> },
                    { label: 'Contact', content: <Typography variant="body2">{building.clientContactName} · {building.clientContactEmail}</Typography> },
                    { label: 'Purpose / Driver', content: <Typography variant="body2">{building.engagementPurpose}</Typography> },
                  ],
                },
              ]}
            />
            <SectionedFormTable
              sections={[
                {
                  title: 'Asset Portfolio',
                  rows: [
                    { label: 'Portfolio Name', content: <Typography variant="body2" sx={{ fontWeight: 700 }}>{building.portfolioName || `${building.regionName} Portfolio`}</Typography> },
                    { label: 'Portfolio Type', content: <Typography variant="body2">{building.portfolioType || region?.assetClass || building.assetClass}</Typography> },
                    { label: 'Assets in Portfolio', content: <Typography variant="body2">{building.portfolioAssetCountLabel || (region ? `${region.buildingCount} properties` : '—')}</Typography> },
                  ],
                },
              ]}
            />
            <SectionedFormTable
              sections={[
                {
                  title: 'Asset',
                  rows: [
                    { label: 'Address', content: <Typography variant="body2" sx={{ fontWeight: 700 }}>{building.address}</Typography> },
                    { label: 'Year Built', content: <Typography variant="body2">{building.yearBuilt} · {2026 - building.yearBuilt} yrs</Typography> },
                    { label: 'GFA / Storeys', content: <Typography variant="body2">{building.grossFloorAreaSqm.toLocaleString()} m² · {building.storeys} storeys</Typography> },
                    { label: 'Occupancy', content: <Typography variant="body2">{building.occupancyType}</Typography> },
                    { label: 'Structure / Envelope', content: <Typography variant="body2">{building.structureType} · {building.envelopeType}</Typography> },
                  ],
                },
              ]}
            />
            <SectionedFormTable
              sections={[
                {
                  title: 'Project',
                  rows: [
                    { label: 'Assessment Type', content: <Typography variant="body2" sx={{ fontWeight: 700 }}>{currentProject.assessmentType || currentProject.serviceLine}</Typography> },
                    { label: 'Site Visit / Horizon', content: <Typography variant="body2">{currentProject.siteVisitDate} · {currentProject.assessmentHorizonYears} yrs</Typography> },
                    { label: 'P.Eng. Reviewer', content: <Typography variant="body2">{currentProject.pEngReviewerName}, P.Eng.</Typography> },
                    { label: 'Inspector', content: <Typography variant="body2">{currentProject.inspectorName}</Typography> },
                    { label: 'Delivery', content: <Typography variant="body2">{currentProject.deliveryMethod}</Typography> },
                  ],
                },
              ]}
            />
          </Box>
          <Box sx={{ p: 1.5, textAlign: 'right' }}>
            <Button size="small" onClick={() => toast('Record editing ships with a future phase.')}>
              Edit Record
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 2.5,
              bgcolor: '#f3f5f8',
              borderRadius: 2.5,
              p: 0.75,
              minHeight: 0,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-flexContainer': { gap: 0.75, flexWrap: 'wrap' },
              '& .MuiTab-root': {
                minHeight: 36,
                px: 2,
                border: '1px solid transparent',
                borderRadius: 2,
                color: 'text.secondary',
              },
              '& .Mui-selected': {
                bgcolor: '#fff',
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            <Tab value="readiness" label="Readiness" />
            <Tab value="documents" label="Documents" />
            <Tab value="scope" label="Scope Matrix" />
            <Tab value="handoff" label="Handoff" />
          </Tabs>

          {tab === 'readiness' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Readiness Checklist
                </Typography>
                {!readinessAllComplete && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {readiness.length - readinessCompleteCount} open items are blocking handoff to Inspector.
                  </Alert>
                )}
                <Stack spacing={1}>
                  {readiness.map((item, index) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.label}
                          </Typography>
                          <StatusChip label={READINESS_STATUS_LABEL[item.status]} tone={READINESS_STATUS_TONE[item.status]} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {item.sub}
                        </Typography>
                      </Box>
                      <TextField
                        select
                        size="small"
                        value={item.status}
                        onChange={(e) => updateReadiness(index, e.target.value as ReadinessStatus)}
                        sx={{ minWidth: 160 }}
                      >
                        {(Object.keys(READINESS_STATUS_LABEL) as ReadinessStatus[]).map((s) => (
                          <MenuItem key={s} value={s}>
                            {READINESS_STATUS_LABEL[s]}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Open Items {openItems.length > 0 && <StatusChip label={`${openItems.length} blocking`} tone="error" />}
                </Typography>
                {openItems.length > 0 ? (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    These items must be resolved before the Inspector is cleared to start.
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mb: 1.5 }}>
                    No blocking items — Inspector is cleared to start.
                  </Alert>
                )}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {openItems.map((item) => (
                    <Box key={item.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.sub}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Known Concerns from Owner
                </Typography>
                {knownConcerns.length > 0 ? (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {knownConcerns.map((c) => (
                      <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {c.component}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.systemName}
                          </Typography>
                        </Box>
                        <StatusChip label="Flag for Inspector" tone="warning" />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No known condition concerns on file for this building.
                  </Typography>
                )}

                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  AI Intake Assist
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => toast('Building notes extracted from client documents.')}>
                    Extract Building Notes
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => toast('Scope matrix pre-filled from operational context.')}>
                    Generate Scope Matrix
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Demo-only: simulates AI pre-fill from client documents.
                </Typography>
              </Box>
            </Box>
          )}

          {tab === 'documents' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Documents are needed to understand the building history, identify latent deficiencies, and
                support defensible findings. Missing records must be noted in the Limitations section of the
                report.
              </Typography>
              <Stack spacing={1}>
                {INTAKE_DOCUMENTS.map((doc, index) => {
                  const status = documentStatus[index];
                  return (
                    <Box
                      key={doc.name}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.requiredFor}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <StatusChip label={DOCUMENT_STATUS_LABEL[status]} tone={DOCUMENT_STATUS_TONE[status]} />
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={status === 'received'}
                          onClick={() => uploadDocument(index, doc.name)}
                        >
                          {status === 'outstanding' ? 'Upload' : 'Replace'}
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
              {documentsReceivedCount < INTAKE_DOCUMENTS.length && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {INTAKE_DOCUMENTS.length - documentsReceivedCount} document
                  {INTAKE_DOCUMENTS.length - documentsReceivedCount === 1 ? '' : 's'} outstanding. These
                  gaps will be documented in the Limitations &amp; Assumptions section.
                </Alert>
              )}
            </Box>
          )}

          {useCompactScopeMatrix && tab === 'scope' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Systems selected for this engagement. The Inspector field library is generated from this
                scope. Set each system to In Scope, Limited, Excluded, or Optional / Review, then approve
                the scope package to unlock Inspector handoff.
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {(systems ?? []).map((s) => {
                  const status = scopeStatusFor(s.systemName);
                  return (
                    <Box
                      key={s.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        gap: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ minWidth: 60 }}>
                        <Typography variant="caption" color="text.secondary">
                          {UNIFORMAT_CODE_BY_SYSTEM[s.systemName]}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 160 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {s.systemName}
                        </Typography>
                      </Box>
                      <TextField
                        select
                        size="small"
                        value={status}
                        onChange={(e) => setSystemScopeStatus(currentProject.id, s.systemName, e.target.value as SystemScopeStatus)}
                        sx={{ minWidth: 140 }}
                      >
                        {(Object.keys(SCOPE_STATUS_LABEL) as SystemScopeStatus[]).map((v) => (
                          <MenuItem key={v} value={v}>
                            {SCOPE_STATUS_LABEL[v]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 170 }}>
                        {SCOPE_METHOD_BY_SYSTEM[s.systemName]}
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="Notes…"
                        value={scopeNotes[s.id] ?? ''}
                        onChange={(e) => setScopeNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        sx={{ flex: 1, minWidth: 180 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
              <Button
                variant="contained"
                onClick={() => approveScope(currentProject.id)}
                disabled={intakeState.scopeApproved || !canApprove || !canEdit}
              >
                {intakeState.scopeApproved ? 'Scope Approved' : 'Apply to Scope Matrix / Approve Scope Package'}
              </Button>
              {!canApprove && !intakeState.scopeApproved && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  You don&apos;t have Approve permission. Ask an administrator to grant it in Administration
                  → Employees.
                </Typography>
              )}
            </Box>
          )}

          {!useCompactScopeMatrix && tab === 'scope' && (
            <ScopeMatrixPanel
              context={intakeState.approvedOperationalContext}
              statuses={intakeState.systemScopeStatus}
              methods={scopeMethods}
              notes={scopeNotes}
              canEdit={canEdit}
              canApprove={canApprove}
              approved={intakeState.scopeApproved}
              onMethodChange={(code, value) => setScopeMethods((prev) => ({ ...prev, [code]: value }))}
              onNoteChange={(code, value) => setScopeNotes((prev) => ({ ...prev, [code]: value }))}
              onApprove={() => approveScope(currentProject.id)}
            />
          )}

          {tab === 'handoff' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Pre-Inspection Handoff Package
                </Typography>
                {openItems.length > 0 && (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {openItems.length} open item{openItems.length === 1 ? '' : 's'} must be resolved before
                    Inspector is cleared. See Readiness tab.
                  </Alert>
                )}
                <SectionedFormTable
                  sections={[
                    {
                      title: 'Handoff Details',
                      rows: [
                        { label: 'Site Visit', content: <Typography variant="body2">{currentProject.siteVisitDate}</Typography> },
                        { label: 'Inspector', content: <Typography variant="body2">{currentProject.inspectorName}</Typography> },
                        { label: 'Superintendent', content: <Typography variant="body2">{building.siteSuperintendentName} · {building.siteSuperintendentPhone}</Typography> },
                        { label: 'Roof access', content: <Typography variant="body2">{building.roofAccessNotes}</Typography> },
                        { label: 'Parking access', content: <Typography variant="body2">{building.parkingAccessNotes}</Typography> },
                        {
                          label: 'Known concerns',
                          content: (
                            <Typography variant="body2">
                              {knownConcerns.length > 0 ? knownConcerns.map((c) => c.component).join(', ') : 'None on file'}
                            </Typography>
                          ),
                        },
                        {
                          label: 'Scope package',
                          content: <Typography variant="body2">{inScopeCount} in scope · {limitedCount} limited · {excludedSystems.length} excluded</Typography>,
                        },
                        {
                          label: 'Documents sent',
                          content: <Typography variant="body2">{documentsReceivedCount}/{INTAKE_DOCUMENTS.length} received</Typography>,
                        },
                      ],
                    },
                  ]}
                />
                <Typography sx={{ ...subsectionTitleSx, mt: 2, mb: 1 }}>
                  Inspector Briefing Notes
                </Typography>
                <Box
                  aria-label="Inspector briefing notes"
                  sx={{
                    bgcolor: '#f7f9fc',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    mb: 2,
                  }}
                >
                  <Stack component="ul" spacing={1} sx={{ my: 0, pl: 2.5 }}>
                    {INSPECTOR_BRIEFING_NOTES.map((note) => (
                      <Typography key={note} component="li" variant="body2" color="text.secondary">
                        {note}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Button variant="contained" sx={softBlueButtonSx} onClick={() => toast('Inspection package generated.')}>
                    Generate Inspection Package
                  </Button>
                  <Tooltip title={canConfirmHandoff ? '' : 'Complete readiness and approve the scope package first.'} disableHoverListener={canConfirmHandoff}>
                    <span>
                      <Button
                        variant="contained"
                        sx={navyButtonSx}
                        disabled={!canConfirmHandoff}
                        onClick={() => toast('Handoff confirmed — Inspector notified.')}
                      >
                        Confirm Handoff to Inspector
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
                {!canConfirmHandoff && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Complete readiness and approve the scope package before confirming handoff.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  Intake Decision Panel
                </Typography>
                <Alert severity={readinessAllComplete ? 'success' : 'warning'} sx={{ mb: 1.5 }}>
                  Intake is {readinessPct}% complete.{' '}
                  {openItems.length > 0
                    ? `${openItems.length} open item${openItems.length === 1 ? ' is' : 's are'} blocking inspector clearance.`
                    : 'No items are blocking inspector clearance.'}
                </Alert>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Once all items are cleared, click Confirm Handoff to send the scope package and briefing
                  notes to the Inspector.
                </Alert>
                <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                  AI Intake Assist
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => toast('Building notes extracted from client documents.')}>
                    Extract Building Notes
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => toast('Scope matrix pre-filled from operational context.')}>
                    Generate Scope Matrix
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Demo-only actions: simulates intake pre-fill and scope generation without changing the
                  underlying project record.
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <NewAssessmentModal open={newAssessmentOpen} onClose={() => setNewAssessmentOpen(false)} />
    </Box>
    </StepAccessGate>
  );
}

interface ScopeMatrixPanelProps {
  context: 'bca' | 'envelope';
  statuses: Record<string, SystemScopeStatus>;
  methods: Record<string, string>;
  notes: Record<string, string>;
  canEdit: boolean;
  canApprove: boolean;
  approved: boolean;
  onMethodChange: (code: string, value: string) => void;
  onNoteChange: (code: string, value: string) => void;
  onApprove: () => void;
}

function ScopeMatrixPanel({ context, statuses, methods, notes, canEdit, canApprove, approved, onMethodChange, onNoteChange, onApprove }: ScopeMatrixPanelProps) {
  const contextLabel = context === 'envelope' ? 'Building Envelope' : 'BCA';

  return (
    <Box>
      <Typography component="h2" sx={{ color: legacyTokens.navy, fontSize: { xs: 22, md: 25 }, fontWeight: 900, mb: 0.5 }}>
        ASTM Scope Matrix · {contextLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 900, mb: 2 }}>
        Building Envelope scope selected: ASTM tree is narrowed to roofing, exterior walls, windows,
        doors, waterproofing, sealants, flashing, moisture, thermal, and drone/IR evidence.
      </Typography>

      <ScopeCallout>
        Scope Matrix generated from PM-selected ASTM statuses. Excluded systems do not flow to Inspector,
        workbook, report, or delivery outputs.
      </ScopeCallout>

      <Stack spacing={1} sx={{ my: 2.5 }}>
        {ENVELOPE_APPROVED_SCOPE.map((row) => {
          const statusKey = SYSTEM_NAME_BY_UNIFORMAT_L2[row.code] ?? row.code;
          const status = statuses[statusKey] ?? row.defaultStatus;
          return (
            <ScopeStatusRow key={row.code} code={row.code} name={row.name} status={status} />
          );
        })}
      </Stack>

      <ScopeCallout>
        Scope Matrix synchronized with PM-selected ASTM scope statuses for: {contextLabel}.
      </ScopeCallout>

      <Box sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
        <Box sx={{ minWidth: 1050 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '100px 190px 130px 260px 1fr', gap: 1.5, bgcolor: '#f3f5f8', px: 2, py: 1.35 }}>
            {['Uniformat', 'System', 'Scope', 'Method', 'Notes'].map((heading) => (
              <Typography key={heading} variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>{heading}</Typography>
            ))}
          </Box>
          {FULL_SCOPE_MATRIX.map((row) => {
            const status = statuses[row.statusKey] ?? row.defaultStatus;
            return (
              <Box key={row.code} sx={{ display: 'grid', gridTemplateColumns: '100px 190px 130px 260px 1fr', gap: 1.5, alignItems: 'center', px: 2, py: 1.15, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.code}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.system}</Typography>
                <ScopeStatus status={status} tableLabel />
                <TextField size="small" value={methods[row.code] ?? ''} onChange={(e) => onMethodChange(row.code, e.target.value)} disabled={!canEdit} slotProps={{ htmlInput: { 'aria-label': `${row.system} inspection method` } }} />
                <TextField size="small" value={notes[row.code] ?? ''} onChange={(e) => onNoteChange(row.code, e.target.value)} disabled={!canEdit} slotProps={{ htmlInput: { 'aria-label': `${row.system} scope notes` } }} />
              </Box>
            );
          })}
        </Box>
      </Box>

      <Button variant="contained" onClick={onApprove} disabled={approved || !canApprove || !canEdit} sx={{ mt: 2.5 }}>
        {approved ? 'Scope Approved' : 'Apply to Scope Matrix / Approve Scope Package'}
      </Button>
      {!canApprove && !approved && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          You don&apos;t have Approve permission. Ask an administrator to grant it in Administration → Employees.
        </Typography>
      )}
    </Box>
  );
}

function ScopeCallout({ children }: { children: React.ReactNode }) {
  return (
    <Box role="note" sx={{ bgcolor: legacyTokens.greenSoft, borderLeft: `4px solid ${legacyTokens.green}`, borderRadius: 1.5, color: '#185c46', px: 2, py: 1.5, fontWeight: 650 }}>
      {children}
    </Box>
  );
}

function ScopeStatus({ status, tableLabel = false }: { status: SystemScopeStatus; tableLabel?: boolean }) {
  const colors: Record<SystemScopeStatus, { bg: string; fg: string }> = {
    inScope: { bg: legacyTokens.greenSoft, fg: legacyTokens.green },
    limited: { bg: legacyTokens.amberSoft, fg: legacyTokens.amber },
    excluded: { bg: '#eef1f4', fg: '#667085' },
    optionalReview: { bg: legacyTokens.blueSoft, fg: legacyTokens.blue },
  };
  const label = tableLabel && status === 'inScope' ? 'In scope' : SCOPE_STATUS_LABEL[status];
  return <StatusChip label={label} tone="neutral" bg={colors[status].bg} fg={colors[status].fg} />;
}
