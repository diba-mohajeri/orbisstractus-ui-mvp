import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import HeroBanner from '../../../shared/components/HeroBanner';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import ScoreCard from '../../../shared/components/ScoreCard';
import AIDisclaimerBanner from '../../../shared/components/AIDisclaimerBanner';
import StatusChip, { riskTone } from '../../../shared/components/StatusChip';
import { useBenchmarkMatrix, useCapitalForecastHorizons, usePortfolioSummary } from '../api';
import { useBenchmarkScores, useReserveForecastByRegion, useRiskForecast } from './api';

export default function PredictiveAnalyticsPage() {
  const { data: summary } = usePortfolioSummary();
  const { data: benchmarkScores, isLoading: scoresLoading } = useBenchmarkScores();
  const { data: riskForecast, isLoading: riskLoading } = useRiskForecast(10);
  const { data: horizons, isLoading: horizonsLoading } = useCapitalForecastHorizons();
  const { data: reserveByRegion, isLoading: reserveLoading } = useReserveForecastByRegion();
  const { data: benchmarkMatrix, isLoading: matrixLoading } = useBenchmarkMatrix();

  const predictedFailures = riskForecast?.filter((r) => r.failureProbabilityPct >= 70).length ?? 0;
  const belowHealthyCount = benchmarkScores?.filter((b) => b.score < 80).length ?? 0;

  const kpis: KpiTileData[] = summary
    ? [
        { label: 'Predicted Failures (High Prob.)', value: String(predictedFailures), tone: 'error' },
        { label: 'Capital Exposure', value: summary.capitalForecast30yr, tone: 'warning' },
        { label: 'High-Risk Items', value: String(summary.highRiskItems), tone: 'error' },
        { label: 'Portfolio Health', value: `${summary.portfolioHealthPct}%`, tone: 'success' },
        { label: 'Below Benchmark (80)', value: String(belowHealthyCount), tone: 'warning' },
        { label: 'Reserve Requirements', value: summary.reserveRequirements, tone: 'neutral' },
      ]
    : [];

  const riskColumns: GridColDef[] = [
    { field: 'id', headerName: 'Asset ID', width: 100 },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 140 },
    { field: 'component', headerName: 'Component', flex: 1, minWidth: 150 },
    { field: 'failureProbabilityPct', headerName: 'Failure Prob.', width: 120, type: 'number' },
    { field: 'trajectory', headerName: 'Trajectory', width: 110 },
    { field: 'inspectionUrgency', headerName: 'Inspection Urgency', width: 150 },
    { field: 'timeToCapitalNeedYears', headerName: 'Time to Capital Need', width: 160, type: 'number' },
  ];

  const matrixColumns: GridColDef[] = [
    { field: 'rank', headerName: 'Rank', width: 70, type: 'number' },
    { field: 'name', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'regionName', headerName: 'Region', width: 120 },
    { field: 'healthPct', headerName: 'Score', width: 90, type: 'number' },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => <StatusChip label={params.value} tone={riskTone(params.value)} />,
    },
    { field: 'capitalExposureFormatted', headerName: 'Capital Exposure', width: 150 },
    { field: 'reserveRequirementFormatted', headerName: 'Reserve Req.', width: 140 },
  ];

  const qa = [
    riskForecast?.[0] && {
      question: 'Which component has the highest predicted failure probability?',
      answer: `${riskForecast[0].component} (${riskForecast[0].systemName}) at ${riskForecast[0].buildingName} — ${riskForecast[0].failureProbabilityPct}% probability, ${riskForecast[0].inspectionUrgency} priority.`,
      decision: 'Escalate to Action & Remediation',
      confidence: 'High',
    },
    horizons?.find((h) => h.key === '5yr') && {
      question: 'What capital exposure should we plan for in the next 5 years?',
      answer: `${horizons.find((h) => h.key === '5yr')!.totalCostFormatted} across ${horizons.find((h) => h.key === '5yr')!.assetCount} components.`,
      decision: 'Include in 5-Year Capital Plan',
      confidence: 'High',
    },
    benchmarkScores && {
      question: 'How many buildings are below a healthy benchmark score (80/100)?',
      answer: `${belowHealthyCount} of ${benchmarkScores.length} buildings score below 80.`,
      decision: 'Schedule benchmark review with asset managers',
      confidence: 'Medium',
    },
  ].filter(Boolean) as { question: string; answer: string; decision: string; confidence: string }[];

  return (
    <Box>
      <HeroBanner
        title="Predictive Analytics & Benchmarking Hub"
        description="Forecast failures, capital exposure, reserve gaps, and risk trajectory across the portfolio — powered by the same asset register that drives every other hub."
        badges={['Predictive Intelligence', 'Benchmarking Engine']}
        metrics={
          summary
            ? [
                { label: 'High-Risk Items', value: String(summary.highRiskItems) },
                { label: 'Capital Exposure', value: summary.capitalForecast30yr },
              ]
            : []
        }
      />

      <KpiStrip items={kpis} />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Benchmarking Engine
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Every building scored 0-100 on current condition, worst-scoring first.
          </Typography>
          {scoresLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
              {(benchmarkScores ?? []).map((b) => (
                <ScoreCard
                  key={b.id}
                  title={b.name}
                  score={b.score}
                  meta={[
                    { label: 'Region', value: b.regionName },
                    { label: 'Risk', value: b.riskLevel },
                    { label: 'Capital Exposure', value: b.capitalExposureFormatted },
                  ]}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Risk Forecast Engine
          </Typography>
          <DataTable columns={riskColumns} rows={riskForecast ?? []} loading={riskLoading} height={380} />
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Capital Forecast Engine
            </Typography>
            {horizonsLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : (
              <Stack spacing={1}>
                {(horizons ?? []).map((h) => (
                  <Box
                    key={h.key}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {h.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {h.assetCount} components
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {h.totalCostFormatted}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reserve Forecast Benchmarking
            </Typography>
            {reserveLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : (
              <Stack spacing={1}>
                {(reserveByRegion ?? []).map((r) => (
                  <Box key={r.regionName} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {r.regionName}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption" color="text.secondary">
                        Exposure: {r.capitalExposureFormatted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reserve Req.: {r.reserveRequirementFormatted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gap: {r.fundingGapFormatted}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            AI Prediction Engine
          </Typography>
          <AIDisclaimerBanner />
          <Stack spacing={1}>
            {riskForecast?.[0] && (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="body2">
                  Highest failure probability portfolio-wide:{' '}
                  <strong>
                    {riskForecast[0].component} at {riskForecast[0].buildingName}
                  </strong>{' '}
                  ({riskForecast[0].failureProbabilityPct}%).
                </Typography>
              </Box>
            )}
            {benchmarkScores?.[0] && (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="body2">
                  Lowest benchmark score: <strong>{benchmarkScores[0].name}</strong> at{' '}
                  {benchmarkScores[0].score}/100.
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Executive Decision Support
          </Typography>
          <Stack spacing={1.5}>
            {qa.map((row) => (
              <Box key={row.question} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {row.question}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {row.answer}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <StatusChip label={row.decision} tone="neutral" />
                  <StatusChip label={`${row.confidence} confidence`} tone={row.confidence === 'High' ? 'success' : 'warning'} />
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Portfolio Benchmark Matrix
          </Typography>
          <DataTable columns={matrixColumns} rows={benchmarkMatrix ?? []} loading={matrixLoading} height={480} />
        </CardContent>
      </Card>
    </Box>
  );
}
