import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useReportQaStore } from '../../../../shared/store/reportQaStore';
import { useReports } from '../../../client-portal/api';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useCurrentProject } from '../useCurrentProject';

export default function DeliveryOverviewPanel() {
  const navigate = useNavigate();
  const { currentProject } = useCurrentProject();
  const { data: reports } = useReports();
  const qaState = useReportQaStore((s) => s.getState(currentProject?.id ?? '__none__'));
  const openFlagCount = qaState.flags.filter((f) => f.status === 'open').length;
  const canGenerateFinal = qaState.sealApplied && openFlagCount === 0;
  const buildingReport = (reports ?? []).find((r) => r.buildingId === currentProject?.buildingId);

  const kpis: KpiTileData[] = [
    { label: 'Final PDF', value: canGenerateFinal ? 'Ready' : 'Pending Seal', tone: canGenerateFinal ? 'success' : 'warning' },
    { label: 'Report Status', value: buildingReport?.status ?? 'None', tone: 'neutral' },
    { label: 'Reports Released', value: String((reports ?? []).filter((r) => r.status === 'released').length), tone: 'neutral' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Delivery Status
        </Typography>
        <KpiStrip items={kpis} />
        <Alert severity={canGenerateFinal ? 'success' : 'warning'} sx={{ mb: 1.5 }}>
          {canGenerateFinal
            ? `Final package for ${currentProject?.buildingName ?? 'the current project'} is ready for client release.`
            : `Final package for ${currentProject?.buildingName ?? 'the current project'} is waiting on QA seal.`}
        </Alert>
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/delivery')}>
          Go to Delivery
        </Button>
      </CardContent>
    </Card>
  );
}