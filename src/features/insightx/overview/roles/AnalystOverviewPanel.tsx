import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { formatCurrency } from '../../../../shared/utils/format';
import { useDeficienciesForBuilding } from '../../../client-portal/api';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useCurrentProject } from '../useCurrentProject';

export default function AnalystOverviewPanel() {
  const navigate = useNavigate();
  const { currentProject } = useCurrentProject();
  const { data: deficiencies } = useDeficienciesForBuilding(currentProject?.buildingId ?? null);

  const highPriorityCount = (deficiencies ?? []).filter((d) => d.severity === 'critical' || d.severity === 'high').length;
  const totalCost = (deficiencies ?? []).reduce((sum, d) => sum + d.estimatedCost, 0);

  const kpis: KpiTileData[] = [
    { label: 'Total Deficiencies', value: String(deficiencies?.length ?? 0), tone: 'neutral' },
    { label: 'High Priority', value: String(highPriorityCount), tone: highPriorityCount > 0 ? 'error' : 'success' },
    { label: 'Estimated Cost', value: formatCurrency(totalCost), tone: 'neutral' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Analysis Queue
        </Typography>
        <KpiStrip items={kpis} />
        <Alert severity={highPriorityCount > 0 ? 'warning' : 'info'} sx={{ mb: 1.5 }}>
          {highPriorityCount > 0
            ? `${highPriorityCount} high-priority finding${highPriorityCount === 1 ? '' : 's'} at ${currentProject?.buildingName ?? 'the current project'} need cost and RUL review.`
            : `No high-priority findings awaiting review at ${currentProject?.buildingName ?? 'the current project'}.`}
        </Alert>
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/analysis')}>
          Go to Analysis
        </Button>
      </CardContent>
    </Card>
  );
}