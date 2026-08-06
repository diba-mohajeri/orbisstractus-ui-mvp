import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useToast } from '../../../shared/store/toastStore';
import { legacyTokens } from '../../../theme/theme';
import { useBuildingSummaries, useProjects, useReports } from '../../client-portal/api';
import { useStepAccess } from '../shared/useMyProjectAccess';
import StepAccessGate from '../shared/StepAccessGate';

interface DeliveryOutput {
  id: string;
  title: string;
  description: string;
  output: string;
  purpose: string;
  includes: string;
  carryThrough: string;
  status: string;
  detailStatus: string;
  tone: StatusTone;
}

const outputs: DeliveryOutput[] = [
  {
    id: 'spreadsheet',
    title: 'BCA Capital Planning Spreadsheet',
    description: 'Mandatory · Uniformat L3 rows, RUL, priority band, cost, timing, lifecycle.',
    output: 'BCA Capital Planning Spreadsheet',
    purpose: 'Mandatory client capital-planning and lifecycle workbook.',
    includes: 'Uniformat L1–L5 fields, RUL, priority bands, costs, timing, and lifecycle assumptions.',
    carryThrough: 'Capital items remain linked to approved findings and their source observations.',
    status: 'Ready',
    detailStatus: 'Ready to issue',
    tone: 'success',
  },
  {
    id: 'word',
    title: 'BCA Report — Word File',
    description: 'Customized per client · 16-section PEO-aligned narrative, sealed by P.Eng.',
    output: 'BCA Report — Word File',
    purpose: 'Editable client-customized building condition assessment report.',
    includes: 'Sixteen-section PEO-aligned narrative, findings, recommendations, capital plan, and appendices.',
    carryThrough: 'Technical findings and evidence references remain traceable to source records.',
    status: 'Pending Seal',
    detailStatus: 'Pending P.Eng. seal',
    tone: 'warning',
  },
  {
    id: 'final-pdf',
    title: 'Final Report PDF',
    description: 'Issued copy — generated from sealed Word file.',
    output: 'InsightX Final Report PDF',
    purpose: 'Formal client-facing building condition assessment report.',
    includes: 'Executive summary, scope, findings, recommendations, capital plan, photo appendix references.',
    carryThrough: 'Findings grouped by ASTM/BCA hierarchy with linked source records.',
    status: 'Pending QA',
    detailStatus: 'Pending QA approval',
    tone: 'warning',
  },
  {
    id: 'photo-appendix',
    title: 'Photo Appendix',
    description: 'Tagged media linked to observation and finding records · click to preview.',
    output: 'BCA Photo Appendix',
    purpose: 'Client-facing visual record supporting the assessment findings.',
    includes: 'Tagged inspection photos, thermal images, drone media, markups, and captions.',
    carryThrough: 'Every media item retains its observation ID and associated deficiency link.',
    status: 'Preview',
    detailStatus: 'Available for preview',
    tone: 'warning',
  },
  {
    id: 'summary-email',
    title: 'Client Summary Email',
    description: 'Plain-language issue summary and next actions.',
    output: 'Client Summary Email',
    purpose: 'Plain-language delivery notice for the client and project stakeholders.',
    includes: 'Issue summary, priority actions, attached deliverables, and recommended next steps.',
    carryThrough: 'Summary statements reflect approved findings and final report recommendations.',
    status: 'Draft',
    detailStatus: 'Draft for review',
    tone: 'warning',
  },
];

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, minWidth: 150, p: 1.5 }}>
      <Typography sx={{ color: legacyTokens.navy, fontSize: 25, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'grid', gap: 2, gridTemplateColumns: '155px minmax(0,1fr)', py: 1.25 }}>
      <Typography variant="body2" sx={{ fontWeight: 900 }}>{label}</Typography>
      <Typography component="div" variant="body2">{children}</Typography>
    </Box>
  );
}

export default function DeliveryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const { data: projects } = useProjects();
  const { data: buildings } = useBuildingSummaries();
  const { data: reports } = useReports();

  const activeProjects = (projects ?? []).filter((project) => project.status !== 'complete');
  const currentProject = activeProjects.find((project) => project.id === currentProjectId) ?? activeProjects[0];
  const { level: stepAccessLevel, isLoading: accessLoading, canEdit } = useStepAccess(currentProject?.id, 'delivery');
  const building = buildings?.find((item) => item.id === currentProject?.buildingId);
  const buildingReport = (reports ?? []).find((report) => report.buildingId === currentProject?.buildingId);

  const [selectedOutputId, setSelectedOutputId] = useState('final-pdf');
  const selectedOutput = outputs.find((output) => output.id === selectedOutputId) ?? outputs[2];

  function previewReport() {
    if (buildingReport) {
      navigate(`/report-viewer/${buildingReport.id}?mode=preview&from=insightx`);
      return;
    }
    toast('Report preview is being prepared.');
  }

  if (!currentProject) {
    return <Typography color="text.secondary">Loading project…</Typography>;
  }

  return (
    <StepAccessGate level={stepAccessLevel} stepLabel="Delivery" isLoading={accessLoading}>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 }, '&:last-child': { pb: { xs: 2, lg: 3 } } }}>
          <Box sx={{ alignItems: 'center', display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1fr) 390px' } }}>
            <Box>
              <Typography component="h1" sx={{ color: legacyTokens.navy, fontSize: { xs: 26, lg: 32 }, fontWeight: 900, mb: .6 }}>
                InsightX Delivery / Client Output Workspace · BCA
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 790, mb: 2 }}>
                Packages the approved BCA assessment record into client-facing deliverables including PDF report, Excel capital plan, photo appendix, and client summary.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button variant="contained" sx={{ bgcolor: legacyTokens.navy, '&:hover': { bgcolor: '#102d50' } }} onClick={previewReport}>
                  Preview Report
                </Button>
                <Button onClick={openTechnicalDrawer} sx={{ bgcolor: '#e9effc', color: legacyTokens.blue, '&:hover': { bgcolor: '#dde8fa' } }}>
                  Open Delivery Technical Layer
                </Button>
              </Stack>
            </Box>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <Metric value="5" label="Client outputs" />
              <Metric value="2" label="Ready to issue" />
              <Metric value="XLS" label="Spreadsheet — mandatory" />
              <Metric value="P.Eng." label="Seal pending" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ alignItems: 'start', display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px,.9fr) minmax(440px,1.35fr) minmax(325px,.95fr)' } }}>
        <Card>
          <CardContent sx={{ p: 2.25 }}>
            <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900, mb: 1.2 }}>Client Package · BCA</Typography>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              Spreadsheet export is mandatory for all BCA deliveries. Word report is customized per client before issue.
            </Alert>
            <Stack spacing={1}>
              {outputs.map((output) => {
                const selected = output.id === selectedOutputId;
                return (
                  <Box
                    component="button"
                    type="button"
                    key={output.id}
                    onClick={() => setSelectedOutputId(output.id)}
                    sx={{
                      alignItems: 'flex-start',
                      bgcolor: selected ? '#f1f6fc' : '#fff',
                      border: '1px solid',
                      borderColor: selected ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      font: 'inherit',
                      gap: 1,
                      justifyContent: 'space-between',
                      p: 1.35,
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: legacyTokens.navy, fontSize: 15, fontWeight: 900, lineHeight: 1.25 }}>{output.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .4 }}>{output.description}</Typography>
                    </Box>
                    <StatusChip label={output.status} tone={output.tone} />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.25 }}>
            <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900, mb: 1.2 }}>Selected Delivery Output</Typography>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              InsightX presents a clean client package while preserving the Orbisstractus technical audit trail underneath.
            </Alert>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mb: 2 }}>
              <DetailRow label="Output">{selectedOutput.output}</DetailRow>
              <DetailRow label="Purpose">{selectedOutput.purpose}</DetailRow>
              <DetailRow label="Includes">{selectedOutput.includes}</DetailRow>
              <DetailRow label="Technical Carry-Through">{selectedOutput.carryThrough}</DetailRow>
              <DetailRow label="Status"><StatusChip label={selectedOutput.detailStatus} tone={selectedOutput.tone} /></DetailRow>
            </Box>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="success"
              sx={{ minHeight: 48, mb: 1 }}
              disabled={!canEdit}
              onClick={() => toast(`${selectedOutput.output}: final delivery options generated.`)}
            >
              Generate Final Report + Delivery Options
            </Button>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1.45fr 1fr' }, mb: 1 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: legacyTokens.navy, '&:hover': { bgcolor: '#102d50' } }}
                onClick={() => toast('Execution / Remediation Management opened for DEF-ROOF-023.')}
              >
                Execution / Remediation Management
              </Button>
              <Button sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue }} onClick={previewReport}>Preview Report</Button>
            </Box>
            <Button
              fullWidth
              sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue }}
              onClick={() => toast(`${selectedOutput.output} export prepared.`)}
            >
              Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.25 }}>
            <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900, mb: 1.2 }}>Delivery Controls</Typography>
            <Stack spacing={1} sx={{ mb: 2.25 }}>
              <Alert severity="error">Final PDF cannot be issued while any high-risk QA flag remains open.</Alert>
              <Alert severity="success">Capital Planning Excel is ready because L1–L5 fields are populated.</Alert>
              <Alert severity="success">Photo appendix is ready because media is linked to observation IDs.</Alert>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 900, mb: .7 }}>Package Readiness</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 900, pl: 0 }}>Check</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 900, pr: 0 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ pl: 0 }}>Approved findings only</TableCell><TableCell align="right" sx={{ pr: 0 }}><StatusChip label="1 pending" tone="warning" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 0 }}>Excel export populated</TableCell><TableCell align="right" sx={{ pr: 0 }}><StatusChip label="Ready" tone="success" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 0 }}>Photos linked</TableCell><TableCell align="right" sx={{ pr: 0 }}><StatusChip label="Ready" tone="success" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 0 }}>Client summary drafted</TableCell><TableCell align="right" sx={{ pr: 0 }}><StatusChip label="Review" tone="warning" /></TableCell></TableRow>
              </TableBody>
            </Table>
            {building && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Package record: {building.name} · 155 King St W
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
    </StepAccessGate>
  );
}
