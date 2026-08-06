import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useReportQaStore } from '../../../../shared/store/reportQaStore';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useCurrentProject } from '../useCurrentProject';

export default function ReportQaOverviewPanel() {
  const navigate = useNavigate();
  const { currentProject } = useCurrentProject();
  const qaState = useReportQaStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const openFlagCount = qaState.flags.filter((f) => f.status === 'open').length;

  const kpis: KpiTileData[] = [
    { label: 'Open QA Flags', value: String(openFlagCount), tone: openFlagCount > 0 ? 'error' : 'success' },
    { label: 'Total Flags', value: String(qaState.flags.length), tone: 'neutral' },
    { label: 'P.Eng. Seal', value: qaState.sealApplied ? 'Applied' : 'Pending', tone: qaState.sealApplied ? 'success' : 'warning' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Report + QA Status
        </Typography>
        <KpiStrip items={kpis} />
        <Alert severity={openFlagCount > 0 ? 'warning' : qaState.sealApplied ? 'success' : 'info'} sx={{ mb: 1.5 }}>
          {openFlagCount > 0
            ? `${openFlagCount} open QA flag${openFlagCount === 1 ? '' : 's'} block the P.Eng. seal for ${currentProject?.buildingName ?? 'the current project'}.`
            : qaState.sealApplied
              ? `Report for ${currentProject?.buildingName ?? 'the current project'} is sealed and ready for delivery.`
              : `No open QA flags — ready to apply the P.Eng. seal.`}
        </Alert>
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/report-qa')}>
          Go to Report + QA
        </Button>
      </CardContent>
    </Card>
  );
}