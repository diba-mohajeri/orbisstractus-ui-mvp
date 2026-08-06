import { useState } from 'react';
import { Box, Button, Card, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../../../shared/components/HeroBanner';
import { MILESTONE_STAGES } from '../../../domain/projects';
import { useUndergoingProjectDetail, useUndergoingProjects } from './api';
import PhotoAppendixDialog from './PhotoAppendixDialog';
import ExecutionManagementDialog from './ExecutionManagementDialog';
import { CLIENT_ACTIONS, EXECUTION_STATUS, PROJECT_DELIVERABLES } from './projectPresentation';
import { legacyTokens } from '../../../theme/theme';

const pillSx = (tone: 'green' | 'amber') => ({ bgcolor: tone === 'green' ? legacyTokens.greenSoft : legacyTokens.amberSoft, color: tone === 'green' ? legacyTokens.green : legacyTokens.amber, fontWeight: 900, border: 'none' });
const sectionTitleSx = { color: legacyTokens.navy, fontSize: { xs: 22, md: 25 }, fontWeight: 900, letterSpacing: '-.02em', mb: 2 };

export default function UndergoingAssessmentsPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photoAppendixOpen, setPhotoAppendixOpen] = useState(false);
  const [executionOpen, setExecutionOpen] = useState(false);
  const { data: projects, isLoading: projectsLoading } = useUndergoingProjects();
  const activeId = selectedId ?? projects?.[0]?.id ?? null;
  const { data: detail, isLoading: detailLoading } = useUndergoingProjectDetail(activeId);

  return (
    <Box>
      <HeroBanner title="Undergoing Assessments" description="Track assessments currently in progress — milestones, captured evidence, client actions, and interim deliverables in one place." metrics={detail ? [{ label: 'Progress', value: `${detail.progressPct}%` }, { label: 'Client Actions', value: '3' }, { label: 'Current Phase', value: detail.project.currentStage }, { label: 'Evidence', value: '17 items' }] : []} />

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Active Assessments</Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {projectsLoading ? <Typography color="text.secondary">Loading…</Typography> : (projects ?? []).map((project) => (
              <Button key={project.id} onClick={() => setSelectedId(project.id)} sx={{ border: '1px solid', borderColor: project.id === activeId ? 'primary.main' : 'divider', bgcolor: project.id === activeId ? legacyTokens.blueSoft : '#fff', color: project.id === activeId ? legacyTokens.blue : 'text.primary', borderRadius: 99 }}>{project.buildingName} · {project.serviceLine}</Button>
            ))}
          </Stack>
        </Box>

        {detailLoading || !detail ? <Box sx={{ p: 4 }}><Typography color="text.secondary">Loading project detail…</Typography></Box> : (
          <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 } }}>
            <Typography sx={sectionTitleSx}>Project Detail</Typography>
            <Typography sx={{ fontWeight: 800, mb: 2 }}>{detail.project.buildingName} · {detail.project.serviceLine}</Typography>
            <Table size="small" sx={{ mb: 2.5 }}>
              <TableHead><TableRow sx={{ bgcolor: '#f7f9fc' }}><TableCell sx={{ fontWeight: 900, color: 'text.secondary' }}>Milestone</TableCell><TableCell sx={{ fontWeight: 900, color: 'text.secondary' }}>Status</TableCell></TableRow></TableHead>
              <TableBody>{MILESTONE_STAGES.map((stage, index) => <TableRow key={stage}><TableCell>{stage}</TableCell><TableCell><Chip size="small" label={index < detail.milestoneIndex ? 'Complete' : index === detail.milestoneIndex ? 'In progress' : 'Upcoming'} sx={pillSx(index < detail.milestoneIndex ? 'green' : 'amber')} /></TableCell></TableRow>)}</TableBody>
            </Table>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 4 }}>
              <Button onClick={() => navigate(detail.deliverables[0] ? `/report-viewer/${detail.deliverables[0].id}?mode=preview&from=client` : `/portal/reports?building=${detail.project.buildingId}`)} sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue }}>Preview Report</Button>
              <Button onClick={() => setPhotoAppendixOpen(true)} sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue }}>Open Photo Appendix</Button>
            </Stack>

            <Box component="section" sx={{ mb: 4.5 }}>
              <Typography sx={sectionTitleSx}>Client Actions</Typography>
              <Stack spacing={1.15}>{CLIENT_ACTIONS.map((action) => <Box key={action.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, bgcolor: action.complete ? legacyTokens.greenSoft : legacyTokens.amberSoft, borderLeft: '4px solid', borderLeftColor: action.complete ? legacyTokens.green : legacyTokens.amber, borderRadius: 2.5, px: 2, py: 1.55 }}><CheckCircleRoundedIcon sx={{ fontSize: 19, color: action.complete ? legacyTokens.green : legacyTokens.amber }} /><Typography sx={{ fontWeight: 700 }}>{action.text}</Typography></Box>)}</Stack>
            </Box>

            <Box component="section" sx={{ mb: 4.5 }}>
              <Typography sx={sectionTitleSx}>Deliverables</Typography>
              <Table size="small"><TableHead><TableRow sx={{ bgcolor: '#f7f9fc' }}><TableCell sx={{ fontWeight: 900, color: 'text.secondary' }}>Output</TableCell><TableCell sx={{ fontWeight: 900, color: 'text.secondary', width: 210 }}>Status</TableCell></TableRow></TableHead><TableBody>{PROJECT_DELIVERABLES.map((item) => <TableRow key={item.output}><TableCell sx={{ py: 1.7, fontWeight: 700 }}>{item.output}</TableCell><TableCell><Chip size="small" label={item.status} sx={pillSx(item.tone)} /></TableCell></TableRow>)}</TableBody></Table>
            </Box>

            <Box component="section">
              <Typography sx={sectionTitleSx}>Execution / Remediation</Typography>
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', bgcolor: legacyTokens.greenSoft, borderLeft: `4px solid ${legacyTokens.green}`, borderRadius: 2.5, px: 2, py: 1.6, mb: 2 }}><InfoOutlinedIcon sx={{ color: legacyTokens.green }} /><Typography sx={{ fontWeight: 700 }}>Optional post-assessment execution management can be enabled after report delivery and QA approval.</Typography></Box>
              <Table size="small" sx={{ mb: 2.5 }}><TableBody><TableRow><TableCell sx={{ width: 210, fontWeight: 900 }}>Execution Status</TableCell><TableCell><Chip size="small" label={EXECUTION_STATUS} sx={pillSx('amber')} /></TableCell></TableRow><TableRow><TableCell sx={{ fontWeight: 900 }}>Orbisstractus Role</TableCell><TableCell>Owner&apos;s Representative / Program Manager.</TableCell></TableRow><TableRow><TableCell sx={{ fontWeight: 900 }}>Contractor Work</TableCell><TableCell>Performed by third-party contractors, not Orbisstractus</TableCell></TableRow></TableBody></Table>
              <Button onClick={() => setExecutionOpen(true)} sx={{ px: 2.5, py: 1.15, bgcolor: '#eef1ff', color: '#3857a6', '&:hover': { bgcolor: '#e1e6ff' } }}>View Execution Options</Button>
            </Box>
          </Box>
        )}
      </Card>

      <PhotoAppendixDialog open={photoAppendixOpen} onClose={() => setPhotoAppendixOpen(false)} />
      <ExecutionManagementDialog open={executionOpen} onClose={() => setExecutionOpen(false)} buildingName={detail?.project.buildingName} />
    </Box>
  );
}
