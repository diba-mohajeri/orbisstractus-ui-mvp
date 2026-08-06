import { Box, Card, CardContent, Typography } from '@mui/material';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { sectionTitleSx } from '../../shared/pageStyles';
import { usePortfolioSummary } from '../../../client-portal/api';

export default function ExecutiveOverviewPanel() {
  const { data: summary } = usePortfolioSummary();

  const kpis: KpiTileData[] = [
    { label: 'Active Assessments', value: String(summary?.activeAssessments ?? 0), tone: 'neutral' },
    { label: 'Upcoming Projects', value: String(summary?.upcomingProjects ?? 0), tone: 'neutral' },
    { label: 'Open Deficiencies', value: String(summary?.openDeficiencies ?? 0), tone: 'warning' },
    { label: 'High-Risk Items', value: String(summary?.highRiskItems ?? 0), tone: 'error' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Operations Snapshot
        </Typography>
        <KpiStrip items={kpis} />
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: '#fbfcfe' }}>
          <Typography variant="body2">
            Portfolio health is at {summary?.portfolioHealthPct ?? '—'}%, with a 30-year capital forecast
            of {summary?.capitalForecast30yr ?? '—'} across the assessed portfolio.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}