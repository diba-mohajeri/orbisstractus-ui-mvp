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
  TextField,
  Typography,
} from '@mui/material';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useToast } from '../../../shared/store/toastStore';
import { legacyTokens } from '../../../theme/theme';
import { useProjects } from '../../client-portal/api';
import { useStepAccess } from '../shared/useMyProjectAccess';
import StepAccessGate from '../shared/StepAccessGate';
import { useReportQaStore } from '../../../shared/store/reportQaStore';
import GenerateReportDraftDialog from './GenerateReportDraftDialog';
import { DEFAULT_REPORT_FINDING_TRACE, formatFindingTrace } from '../shared/traceability';
import EvidenceTile, { type EvidenceKind } from '../../../shared/components/EvidenceTile';

type SectionStatus = 'Ready' | 'Auto' | 'Review' | 'QA Required' | 'Draft';

const sections: Array<{ title: string; description: string; status: SectionStatus }> = [
  { title: 'Cover Page', description: 'Sealed. Firm, engineer, date, CA number.', status: 'Ready' },
  { title: 'Executive Summary', description: 'Top risks, immediate actions, capital triggers.', status: 'Ready' },
  { title: 'Table of Contents', description: 'Auto-generated from approved sections.', status: 'Auto' },
  { title: 'Introduction', description: 'Purpose, context, intended users.', status: 'Ready' },
  { title: 'Scope of Work', description: 'Areas assessed, exclusions, standards applied.', status: 'Ready' },
  { title: 'Limitations & Assumptions', description: 'Access constraints, concealed conditions, sampling.', status: 'Ready' },
  { title: 'Methodology', description: 'Tools, personnel, site visit dates, photography.', status: 'Ready' },
  { title: 'Document Review', description: 'Drawings, prior reports, maintenance logs.', status: 'Ready' },
  { title: 'Building Description', description: 'Year built, occupancy, structure, envelope overview.', status: 'Ready' },
  { title: 'Observations & Findings', description: 'Uniformat L3 organized. Narrative + tabular + photos.', status: 'Review' },
  { title: 'Deficiency Assessment', description: 'Structural / Water-Moisture / Envelope / Safety / Code / Operational.', status: 'Review' },
  { title: 'Risk / Priority Classification', description: 'Immediate / Short-Term / Medium-Term / Long-Term / Monitor.', status: 'QA Required' },
  { title: 'Recommendations', description: 'Repair, replacement, monitoring, further study.', status: 'QA Required' },
  { title: 'Capital Planning / Cost Estimates', description: 'Immediate budget, multi-year plan, reserve, phased.', status: 'QA Required' },
  { title: 'Conclusion', description: 'Overall condition, key themes, next steps.', status: 'Draft' },
  { title: 'Appendices', description: 'Photo log, deficiency tables, drawing references, Uniformat export.', status: 'Auto' },
];

const sectionOutputs = [
  'Firm identity, assessment title, property address, engineer, certificate of authorization, and issue date.',
  'Executive-ready summary of the three highest-priority findings, immediate actions, and capital triggers.',
  'Generated section index with approved heading hierarchy and final page references.',
  'Assessment purpose, building context, intended users, and basis of report.',
  'Assessed systems, accessed areas, exclusions, and applicable professional standards.',
  'Access constraints, concealed-condition caveats, sampling limits, and working assumptions.',
  'Inspection tools, assessment personnel, site visit dates, testing approach, and photography protocol.',
  'Reviewed drawings, prior assessments, maintenance records, and supporting building documents.',
  'Building age, use, occupancy, construction, structure, and envelope configuration.',
  'Three approved findings organized to Uniformat Level 3 with narratives, tables, and linked evidence.',
  'Deficiencies classified by structural, moisture, envelope, safety, code, and operational risk.',
  'Each finding assigned an Immediate, Short-Term, Medium-Term, Long-Term, or Monitor priority.',
  'Repair, replacement, monitoring, and further-study actions linked to each approved finding.',
  'Immediate allowance, ten-year capital plan, reserve requirements, and recommended phasing.',
  'Overall condition opinion, recurring risk themes, and recommended next steps.',
  'Photo log, deficiency schedule, drawing references, evidence index, and Uniformat export.',
];

const statusTones: Record<SectionStatus, StatusTone> = {
  Ready: 'success',
  Auto: 'neutral',
  Review: 'warning',
  'QA Required': 'warning',
  Draft: 'neutral',
};

const evidence: Array<{ kind: EvidenceKind; caption: string }> = [
  { kind: 'ROOF', caption: 'Ponding water — north bay' },
  { kind: 'ROOF', caption: 'Roof seam separation — section C' },
  { kind: 'ROOF', caption: 'Membrane blistering — south slope' },
  { kind: 'ROOF', caption: 'Roof drain sump — debris loading' },
  { kind: 'ROOF', caption: 'Flashing corrosion at parapet' },
  { kind: 'THERM', caption: 'Thermal moisture anomaly — IR' },
  { kind: 'THERM', caption: 'Thermal bridging at slab edge — IR' },
  { kind: 'DRONE', caption: 'Drone aerial overview — north elevation' },
  { kind: 'AUDIO', caption: 'VOICE_001' },
  { kind: 'MARKUP', caption: 'Markup — defect callouts' },
  { kind: 'VIDEO', caption: 'VIDEO_001' },
];

const sectionLabelSx = {
  color: 'text.secondary',
  display: 'block',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '.11em',
  mb: 1,
  textTransform: 'uppercase',
};

const rowCardSx = {
  alignItems: 'flex-start',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  display: 'flex',
  gap: 1,
  justifyContent: 'space-between',
  p: 1.25,
};

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: '#fff', p: 1.5, minWidth: 150 }}>
      <Typography sx={{ color: legacyTokens.navy, fontSize: 25, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function AssemblyItem({ title, description, status, tone }: { title: string; description: string; status: string; tone: StatusTone }) {
  return (
    <Box sx={rowCardSx}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      </Box>
      <StatusChip label={status} tone={tone} />
    </Box>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: 1.5, py: 1.15, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>{label}</Typography>
      <Typography component="div" variant="body2">{children}</Typography>
    </Box>
  );
}

export default function ReportQaPage() {
  const openTechnicalDrawer = useInsightXShellStore((s) => s.openTechnicalDrawer);
  const toast = useToast();
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const { data: projects } = useProjects();
  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  const { level: stepAccessLevel, isLoading: accessLoading, canEdit } = useStepAccess(currentProject?.id, 'reportqa');
  const qaState = useReportQaStore((state) => state.getState(currentProject?.id ?? '__none__'));
  const generateDraft = useReportQaStore((state) => state.generateDraft);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(10);
  const [approved, setApproved] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [findingApproved, setFindingApproved] = useState(false);
  const [sourceChainOpen, setSourceChainOpen] = useState(false);
  const [sealed, setSealed] = useState(false);
  const activeSection = sections[selectedSection - 1];
  const activeSectionStatus = approved.includes(selectedSection) ? 'Ready' : activeSection.status;
  const isFindingsSection = selectedSection === 10;

  function handleGenerateDraft() {
    if (!currentProject) return;
    generateDraft(currentProject.id);
    setGenerateDialogOpen(true);
  }

  if (!currentProject) {
    return <Typography color="text.secondary">Loading project…</Typography>;
  }

  return (
    <StepAccessGate level={stepAccessLevel} stepLabel="Report + QA" isLoading={accessLoading}>
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 }, '&:last-child': { pb: { xs: 2, lg: 3 } } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1fr) 390px' }, gap: 3, alignItems: 'center' }}>
            <Box>
              <Typography component="h1" sx={{ color: legacyTokens.navy, fontSize: { xs: 26, lg: 32 }, fontWeight: 900, mb: .6 }}>
                Report + QA Workspace · BCA
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 810, mb: 2 }}>
                Assemble and validate the BCA deliverable package: findings table, capital schedule, Word report, Excel appendix, QA review, and P.Eng. sign-off.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button variant="contained" color="success" onClick={handleGenerateDraft}>Generate Report Draft</Button>
                <Button variant="contained" sx={{ bgcolor: legacyTokens.navy }} disabled={!canEdit} onClick={() => {
                  setApproved((items) => items.includes(selectedSection) ? items : [...items, selectedSection]);
                  toast(`Section ${selectedSection} approved.`);
                }}>Approve Selected Section</Button>
                <Button onClick={openTechnicalDrawer} sx={{ bgcolor: '#e9effc', color: legacyTokens.blue, '&:hover': { bgcolor: '#dde8fa' } }}>Open Technical Layer</Button>
              </Stack>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              <Metric value="16" label="Report sections (PEO)" />
              <Metric value="2" label="Open QA flags" />
              <Metric value="3" label="Findings queued" />
              <Metric value="P.Eng." label={sealed ? 'Seal applied' : 'Seal pending'} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(285px,.85fr) minmax(430px,1.35fr) minmax(330px,1fr)' }, gap: 2, alignItems: 'start' }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
              <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900 }}>Report Assembly</Typography>
              <Box sx={{ bgcolor: '#e9effc', color: legacyTokens.blue, borderRadius: 8, px: 1.1, py: .35, fontSize: 11, fontWeight: 900 }}>BCA · PEO-Aligned</Box>
            </Stack>
            <Stack spacing={1}>
              {sections.map((section, index) => {
                const number = index + 1;
                const isSelected = selectedSection === number;
                const status = approved.includes(number) ? 'Ready' : section.status;
                return (
                  <Box component="button" type="button" key={section.title} onClick={() => setSelectedSection(number)}
                    sx={{ ...rowCardSx, width: '100%', textAlign: 'left', font: 'inherit', cursor: 'pointer', bgcolor: isSelected ? '#f1f6fc' : '#fff', borderColor: isSelected ? 'primary.main' : 'divider' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{number}. {section.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .25 }}>{section.description}</Typography>
                    </Box>
                    <StatusChip label={status} tone={statusTones[status]} />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Card>
            <CardContent sx={{ p: 2.25 }}>
              <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900, mb: .35 }}>Generate &amp; Assemble</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Step 1: Generate structured outputs from approved analyst records. Step 2: Assemble into client deliverable formats.
              </Typography>
              <Typography sx={sectionLabelSx}>Step 1 · Generate</Typography>
              <Stack spacing={1} sx={{ mb: 2.2 }}>
                <AssemblyItem title="Findings Table" description="3 approved deficiencies · Uniformat L3 organized" status={qaState.draftGenerated ? 'Generated' : 'Ready to Generate'} tone={qaState.draftGenerated ? 'success' : 'warning'} />
                <AssemblyItem title="Capital Schedule" description="10-year horizon · CIQS/RSMeans · 3 line items" status={qaState.draftGenerated ? 'Generated' : 'Ready to Generate'} tone={qaState.draftGenerated ? 'success' : 'warning'} />
              </Stack>
              <Typography sx={sectionLabelSx}>Step 2 · Assemble</Typography>
              <Stack spacing={1}>
                <AssemblyItem title="Word Report" description="16-section PEO-aligned narrative · all sections populated" status={qaState.draftGenerated ? 'Ready for QA' : 'Not Generated'} tone="warning" />
                <AssemblyItem title="Excel Appendix" description="L1–L5 rows · RUL · priority band · cost · timing" status="Ready" tone="success" />
                <AssemblyItem title="Photo Appendix" description="14 tagged images linked to observation and finding records" status="Ready" tone="success" />
                <AssemblyItem title="Drawing References" description="Envelope details, markup drawings from Inspector · if applicable" status="Included" tone="success" />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.25 }}>
              <Typography sx={sectionLabelSx}>{isFindingsSection ? 'Selected Finding Detail' : 'Selected Section Detail'}</Typography>
              <Typography sx={{ color: legacyTokens.navy, fontSize: 18, fontWeight: 900, mb: .75 }}>
                {selectedSection}. {activeSection.title}
              </Typography>
              {isFindingsSection ? (
                <>
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                    <DetailRow label="Record Chain">OBS-ROOF-023 → DEF-ROOF-023</DetailRow>
                    <DetailRow label="Code Path">B → B30 → B3010 → B3010.10 → B3010.10.02</DetailRow>
                    <DetailRow label="Finding">Roof membrane lap seam failure contributing to localized ponding and leakage risk.</DetailRow>
                    <DetailRow label="Recommendation">Targeted membrane repairs now + replacement allowance in near-term capital plan.</DetailRow>
                    <DetailRow label="Capital Line">$42,000 repair allowance + replacement flag</DetailRow>
                    <DetailRow label="Status"><StatusChip label={findingApproved ? 'Approved' : 'In QA Review'} tone={findingApproved ? 'success' : 'warning'} /></DetailRow>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>Evidence</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
                    {evidence.map((item) => <EvidenceTile key={`${item.kind}-${item.caption}`} {...item} />)}
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
                    <Button variant="contained" color="success" disabled={!canEdit} onClick={() => { setFindingApproved(true); toast('DEF-ROOF-023 approved for report.'); }}>Approve Finding</Button>
                    <Button variant="outlined" onClick={() => setSourceChainOpen((open) => !open)}>
                      {sourceChainOpen ? 'Hide Source Chain' : 'View Source Chain'}
                    </Button>
                  </Stack>
                  {sourceChainOpen && (
                    <Box
                      role="note"
                      sx={{
                        bgcolor: legacyTokens.amberSoft,
                        borderLeft: `4px solid ${legacyTokens.amber}`,
                        borderRadius: 1.5,
                        color: '#805415',
                        px: 2,
                        py: 1.5,
                        mt: 1.5,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Trace:</strong> {formatFindingTrace(DEFAULT_REPORT_FINDING_TRACE)}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                    <DetailRow label="Section">{activeSection.title}</DetailRow>
                    <DetailRow label="Purpose">{activeSection.description}</DetailRow>
                    <DetailRow label="Deliverable">{sectionOutputs[selectedSection - 1]}</DetailRow>
                    <DetailRow label="Status"><StatusChip label={activeSectionStatus} tone={statusTones[activeSectionStatus]} /></DetailRow>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
                    <Button variant="contained" color="success" disabled={!canEdit} onClick={() => {
                      setApproved((items) => items.includes(selectedSection) ? items : [...items, selectedSection]);
                      toast(`${activeSection.title} approved.`);
                    }}>Approve Section</Button>
                    <Button variant="outlined" onClick={() => toast(`Opened source records for Section ${selectedSection}: ${activeSection.title}.`)}>View Section Sources</Button>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>

        <Card>
          <CardContent sx={{ p: 2.25 }}>
            <Typography sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900, mb: 1 }}>QA Review &amp; Sign-Off</Typography>
            <Alert severity="error" sx={{ mb: 2 }}>Safety, Structural, or Critical findings require P.Eng. confirmation before section approval.</Alert>
            <Typography variant="body2" sx={{ fontWeight: 900, mb: .7 }}>QA Flags</Typography>
            <Table size="small" sx={{ mb: 2.5 }}>
              <TableHead><TableRow>
                {['Flag', 'Type', 'Status'].map((label) => <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 900, px: .5 }}>{label}</TableCell>)}
              </TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ px: .5 }}>Roof replacement timing</TableCell><TableCell sx={{ px: .5 }}>Durability</TableCell><TableCell sx={{ px: .5 }}><StatusChip label="Open" tone="error" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ px: .5 }}>Window sealant wording</TableCell><TableCell sx={{ px: .5 }}>Code</TableCell><TableCell sx={{ px: .5 }}><StatusChip label="Closed" tone="success" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ px: .5 }}>Walkway photo label</TableCell><TableCell sx={{ px: .5 }}>H&amp;S</TableCell><TableCell sx={{ px: .5 }}><StatusChip label="Review" tone="warning" /></TableCell></TableRow>
              </TableBody>
            </Table>

            <Typography sx={sectionLabelSx}>QA Comments &amp; Revisions</Typography>
            {comments.map((item, index) => <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'block', mb: .5 }}>{item}</Typography>)}
            <TextField multiline minRows={3} fullWidth value={comment} onChange={(event) => setComment(event.target.value)}
              placeholder="Add a review note, revision instruction, or flag reason…" sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 3 }}>
              <Button sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue }} onClick={() => {
                if (!comment.trim()) return;
                setComments((items) => [...items, comment.trim()]);
                setComment('');
              }}>Add Comment</Button>
              <Button variant="outlined" color="inherit" onClick={() => toast('Sent back to Analyst.')}>Send Back to Analyst</Button>
            </Stack>

            <Typography sx={sectionLabelSx}>P.Eng. Sign-Off</Typography>
            <Alert severity="warning" sx={{ mb: 1.5 }}>Professional seal required before client issue. Validates technical accuracy, findings defensibility, and PEO compliance.</Alert>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }}>
              <DetailRow label="Engineer">J. Smith, P.Eng.</DetailRow>
              <DetailRow label="CA Number">CA-00412</DetailRow>
              <DetailRow label="Seal Status"><StatusChip label={sealed ? 'Applied' : 'Pending'} tone={sealed ? 'success' : 'warning'} /></DetailRow>
            </Box>
            <Button fullWidth variant="contained" color="success" disabled={!canEdit} onClick={() => { setSealed(true); toast('P.Eng. seal applied and report approved.'); }}>
              Apply P.Eng. Seal &amp; Approve
            </Button>

            <Typography sx={{ ...sectionLabelSx, mt: 3 }}>Output Metadata</Typography>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <DetailRow label="Revision">{sealed ? 'Rev 1 — Sealed' : 'Rev 1 — Draft for QA'}</DetailRow>
              <DetailRow label="Issue Date">{sealed ? 'July 29, 2026' : 'Pending seal'}</DetailRow>
              <DetailRow label="Approvals">QA Reviewer · P.Eng. seal</DetailRow>
              <DetailRow label="Version Control">Orbisstractus-BCA-2026-MT-R1</DetailRow>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <GenerateReportDraftDialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} />
    </Box>
    </StepAccessGate>
  );
}
