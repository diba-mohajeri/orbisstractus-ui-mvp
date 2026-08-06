import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useObservationStore } from '../../../../shared/store/observationStore';
import { useBuildingSystems } from '../../../client-portal/api';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useCurrentProject } from '../useCurrentProject';

export default function InspectorOverviewPanel() {
  const navigate = useNavigate();
  const { currentProject } = useCurrentProject();
  const observations = useObservationStore((s) => s.getObservations(currentProject?.id ?? '__none__'));
  const { data: systems } = useBuildingSystems(currentProject?.buildingId ?? null);

  const reviewedCount = observations.filter((o) => o.reviewed).length;
  const pendingCount = observations.length - reviewedCount;

  const kpis: KpiTileData[] = [
    { label: 'Observations Logged', value: String(observations.length), tone: 'neutral' },
    { label: 'Reviewed', value: String(reviewedCount), tone: 'success' },
    { label: 'Pending Review', value: String(pendingCount), tone: pendingCount > 0 ? 'warning' : 'success' },
    { label: 'Building Systems', value: String(systems?.length ?? 0), tone: 'neutral' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Inspector Field Status
        </Typography>
        <KpiStrip items={kpis} />
        <Alert severity={pendingCount > 0 ? 'warning' : 'info'} sx={{ mb: 1.5 }}>
          {pendingCount > 0
            ? `${pendingCount} observation${pendingCount === 1 ? '' : 's'} at ${currentProject?.buildingName ?? 'the current project'} still need review.`
            : `No pending observations at ${currentProject?.buildingName ?? 'the current project'}.`}
        </Alert>
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/inspector')}>
          Go to Inspector
        </Button>
      </CardContent>
    </Card>
  );
}