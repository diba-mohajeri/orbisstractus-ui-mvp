import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import StatusChip from '../../../shared/components/StatusChip';
import { useToast } from '../../../shared/store/toastStore';
import { useBenchmarkMatrix, useCapitalForecastHorizons } from '../api';
import { useBoardKpis } from './api';

const REPORT_PACKAGES = [
  { id: 'board-pdf', name: 'Board Package PDF', status: 'Ready' },
  { id: 'quarterly-review', name: 'Quarterly Asset Review', status: 'Ready' },
  { id: 'annual-health', name: 'Annual Asset Health Report', status: 'Draft' },
  { id: 'reserve-summary', name: 'Reserve Planning Summary', status: 'Ready' },
  { id: 'exec-risk', name: 'Executive Risk Report', status: 'Draft' },
];

export default function BoardReportingPage() {
  const toast = useToast();
  const { data: kpis } = useBoardKpis();
  const { data: benchmarkMatrix } = useBenchmarkMatrix();
  const { data: horizons } = useCapitalForecastHorizons();

  const kpiTiles: KpiTileData[] = kpis
    ? [
        { label: 'Portfolio Risk Score', value: String(kpis.portfolioRiskScore), tone: 'warning' },
        { label: 'Deferred Maintenance Exposure', value: kpis.deferredMaintenanceExposureFormatted, tone: 'warning' },
        { label: 'Reserve Fund Health', value: `${kpis.reserveFundHealthPct}%`, tone: 'success' },
        { label: 'Capital Requirement', value: kpis.capitalRequirementFormatted, tone: 'neutral' },
        { label: 'Building Health Index', value: `${kpis.buildingHealthIndex}%`, tone: 'success' },
        { label: 'ESG Score', value: String(kpis.esgScore), tone: 'success' },
        { label: 'Critical Deficiencies', value: String(kpis.criticalDeficiencies), tone: 'error' },
        { label: 'Upcoming Major Expenditures', value: String(kpis.upcomingMajorExpenditures), tone: 'warning' },
      ]
    : [];

  const worstBuilding = benchmarkMatrix?.[0];
  const fiveYearHorizon = horizons?.find((h) => h.key === '5yr');

  const executiveSummary = [
    {
      label: 'Top Risks',
      description: worstBuilding
        ? `${worstBuilding.name} (${worstBuilding.regionName}) has the lowest health score at ${worstBuilding.healthPct}%.`
        : 'Loading…',
      tone: 'error' as const,
    },
    {
      label: 'Top Capital Needs',
      description: fiveYearHorizon
        ? `${fiveYearHorizon.totalCostFormatted} required within 5 years across ${fiveYearHorizon.assetCount} components.`
        : 'Loading…',
      tone: 'warning' as const,
    },
    {
      label: 'Reserve Fund Sufficiency',
      description: kpis
        ? `Reserve fund health is at ${kpis.reserveFundHealthPct}% of target requirement.`
        : 'Loading…',
      tone: kpis && kpis.reserveFundHealthPct >= 70 ? ('success' as const) : ('warning' as const),
    },
    {
      label: 'Portfolio Health Trends',
      description: kpis
        ? `Building Health Index currently at ${kpis.buildingHealthIndex}%, ESG composite at ${kpis.esgScore}.`
        : 'Loading…',
      tone: 'success' as const,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        Executive Board Reporting
      </Typography>

      <KpiStrip items={kpiTiles} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Board Report Library
            </Typography>
            <Stack spacing={1.25}>
              {REPORT_PACKAGES.map((pkg) => (
                <Box
                  key={pkg.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {pkg.name}
                    </Typography>
                    <StatusChip label={pkg.status} tone={pkg.status === 'Ready' ? 'success' : 'neutral'} />
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => toast(`${pkg.name} queued for generation.`)}>
                    Generate
                  </Button>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Executive Summary View
            </Typography>
            <Stack spacing={1.25}>
              {executiveSummary.map((row) => (
                <Box key={row.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.label}
                    </Typography>
                    <StatusChip label={row.tone === 'error' ? 'Attention' : row.tone === 'warning' ? 'Watch' : 'Stable'} tone={row.tone} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {row.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
