import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReportPrintArea from '../../shared/components/ReportPrintArea';
import OpeFindingCard from '../../shared/components/OpeFindingCard';
import StatusChip from '../../shared/components/StatusChip';
import DataTable from '../../shared/components/DataTable';
import { useToast } from '../../shared/store/toastStore';
import { useReportQaStore } from '../../shared/store/reportQaStore';
import { useProjects } from '../client-portal/api';
import { useReportViewerContent } from './api';

export default function ReportViewerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'preview' | 'final' | null) ?? 'preview';
  const from = searchParams.get('from') ?? 'insightx';
  const returnState = location.state as { returnTo?: string; returnLabel?: string } | null;

  const { data: content, isLoading } = useReportViewerContent(reportId);
  const { data: projects } = useProjects();

  const matchingProject = (projects ?? []).find(
    (p) => p.buildingId === content?.report.buildingId && p.status !== 'complete',
  );
  const qaProjectId = matchingProject?.id ?? '__none__';
  const qaState = useReportQaStore((s) => s.getState(qaProjectId));
  const openFlagCount = qaState.flags.filter((f) => f.status === 'open').length;
  const canGenerateFinal = !matchingProject || (qaState.sealApplied && openFlagCount === 0);

  function setMode(next: 'preview' | 'final') {
    if (next === 'final' && !canGenerateFinal) {
      toast(`Cannot generate final: ${openFlagCount} QA flag(s) still open, or P.Eng seal not yet applied.`);
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('mode', next);
    setSearchParams(params);
  }

  function handleBack() {
    if (returnState?.returnTo) {
      navigate(returnState.returnTo);
    } else if (from === 'client') {
      navigate(-1);
    } else {
      navigate('/insightx/delivery');
    }
  }

  if (isLoading || !content) {
    return <Typography color="text.secondary">Loading report…</Typography>;
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', rowGap: 1 }}
      >
        <Box>
          <Typography variant="h5">{content.report.serviceLine} Report</Typography>
          <Typography variant="body2" color="text.secondary">
            {content.report.buildingName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={handleBack}>
            {returnState?.returnLabel ?? (from === 'client' ? '← Back to Partner Network' : '← Back to Delivery')}
          </Button>
          <Button variant="outlined" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Findings', value: String(content.findings.length) },
          { label: 'Est. Repair Cost', value: content.totalDeficiencyCostFormatted },
          { label: 'Portfolio Health', value: `${content.portfolioHealthPct}%` },
          { label: 'Capital Items', value: String(content.capitalSummary.length) },
        ].map((m) => (
          <Box key={m.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {m.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {m.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <ReportPrintArea>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {content.report.buildingName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prepared for: {content.building?.regionName} Board
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prepared by: InsightX
            </Typography>
          </Box>
          <StatusChip
            label={mode === 'final' ? 'Final Generated' : 'Draft Preview'}
            tone={mode === 'final' ? 'success' : 'warning'}
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          1. Executive Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This report summarizes the condition assessment findings for {content.report.buildingName},
          including {content.findings.length} documented deficiencies totaling an estimated{' '}
          {content.totalDeficiencyCostFormatted} in repair cost, and a portfolio health score of{' '}
          {content.portfolioHealthPct}%.
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          2. Scope &amp; Methodology
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Assessment scope and methodology follow the approved intake scope package, executed
          through field inspection, building science analysis, and P.Eng-reviewed reporting.
        </Typography>

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          3. Findings by System
        </Typography>
        {content.findings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No documented findings for this building.
          </Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            {content.findings.map((f) => (
              <OpeFindingCard
                key={f.id}
                title={f.title}
                severity={f.severity}
                problem={f.problem}
                effect={f.effect}
                recommendation={f.recommendation}
                cost={f.costFormatted}
                sourceTrace={f.id}
              />
            ))}
          </Box>
        )}

        <Typography variant="h6" sx={{ mb: 1.5 }}>
          4. Capital Planning Summary
        </Typography>
        <Box sx={{ mb: 3 }}>
          <DataTable
            columns={[
              { field: 'year', headerName: 'Year', width: 90, type: 'number' },
              { field: 'systemName', headerName: 'System', flex: 1, minWidth: 150 },
              { field: 'recommendedWork', headerName: 'Recommended Work', flex: 1, minWidth: 180 },
              { field: 'costFormatted', headerName: 'Cost', width: 110 },
            ]}
            rows={content.capitalSummary}
            height={280}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 1 }}>
          5. Photo Appendix &amp; Traceability
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Every finding above traces to a field observation captured by Inspector and reviewed by
          Analyst. Full photo appendix ships with the Document Vault integration.
        </Typography>
      </ReportPrintArea>

      <Box sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
        {matchingProject && !canGenerateFinal && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Final PDF cannot be issued while QA flags remain open or the P.Eng seal has not been
            applied ({openFlagCount} open flag{openFlagCount === 1 ? '' : 's'}).
          </Alert>
        )}
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => setMode('preview')} disabled={mode === 'preview'}>
            Preview
          </Button>
          <Button variant="contained" onClick={() => setMode('final')} disabled={mode === 'final' || !canGenerateFinal}>
            Generate Final
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
