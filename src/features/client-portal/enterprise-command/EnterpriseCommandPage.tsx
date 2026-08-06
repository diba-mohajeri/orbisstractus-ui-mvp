import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import HeroBanner from '../../../shared/components/HeroBanner';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import ScoreCard from '../../../shared/components/ScoreCard';
import SeverityTierRow, { type SeverityTierItem } from '../../../shared/components/SeverityTierRow';
import SeverityMatrix from '../../../shared/components/SeverityMatrix';
import LineageFlow from '../../../shared/components/LineageFlow';
import StatusChip, { riskTone, severityTone } from '../../../shared/components/StatusChip';
import { formatCurrency } from '../../../shared/utils/format';
import { useToast } from '../../../shared/store/toastStore';
import {
  useBenchmarkMatrix,
  useCapitalForecastHorizons,
  useHealthTierCounts,
  usePortfolioSummary,
  useRegionSummaries,
} from '../api';
import { useActionCommandItems, useExecutivePriority, useScenarios, useSeverityMatrixByRegion } from './api';

const BOARD_PACKAGES = [
  { id: 'board-pdf', name: 'Board Package PDF', audience: 'Board of Directors', due: 'Quarterly' },
  { id: 'exec-risk', name: 'Executive Risk Report', audience: 'Executive Team', due: 'Monthly' },
  { id: 'reserve-summary', name: 'Reserve Planning Summary', audience: 'Finance Committee', due: 'Annual' },
];

export default function EnterpriseCommandPage() {
  const toast = useToast();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const { data: summary } = usePortfolioSummary();
  const { data: regions, isLoading: regionsLoading } = useRegionSummaries();
  const { data: healthTiers } = useHealthTierCounts();
  const { data: severityMatrix, isLoading: matrixLoading } = useSeverityMatrixByRegion();
  const { data: benchmarkMatrix, isLoading: benchmarkLoading } = useBenchmarkMatrix();
  const { data: actionItems, isLoading: actionLoading } = useActionCommandItems(8);
  const { data: priority } = useExecutivePriority();
  const { data: horizons } = useCapitalForecastHorizons();
  const { data: scenarios } = useScenarios();

  const kpis: KpiTileData[] = summary && regions
    ? [
        { label: 'Buildings', value: String(summary.buildings), tone: 'neutral' },
        { label: 'Regions', value: String(regions.length), tone: 'neutral' },
        { label: 'Portfolio Health', value: `${summary.portfolioHealthPct}%`, tone: 'success' },
        { label: 'Capital Exposure', value: summary.capitalForecast30yr, tone: 'warning' },
        { label: 'Open Deficiencies', value: String(summary.openDeficiencies), tone: 'warning' },
        { label: 'Executive Actions', value: String(actionItems?.length ?? 0), tone: 'neutral' },
      ]
    : [];

  const severityItems: SeverityTierItem[] = (healthTiers ?? []).map((t) => ({
    key: t.tier,
    label: t.label,
    count: t.count,
    description: t.description,
    tone: t.tier === 'healthy' ? 'success' : t.tier === 'monitor' ? 'neutral' : t.tier === 'atRisk' ? 'warning' : 'error',
  }));

  const riskCenterColumns: GridColDef[] = [
    { field: 'rank', headerName: 'Rank', width: 70, type: 'number' },
    { field: 'name', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'regionName', headerName: 'Region', width: 120 },
    { field: 'healthPct', headerName: 'Health', width: 90, type: 'number' },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => <StatusChip label={params.value} tone={riskTone(params.value)} />,
    },
    { field: 'capitalExposureFormatted', headerName: 'Capital Exposure', width: 150 },
  ];

  const capitalAllocationColumns: GridColDef[] = [
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 140 },
    { field: 'systemName', headerName: 'System', flex: 1, minWidth: 140 },
    { field: 'estimatedCostFormatted', headerName: 'Cost', width: 110 },
    {
      field: 'approvalStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <StatusChip label={params.value} tone={params.value === 'Approve Now' ? 'error' : 'warning'} />
      ),
    },
  ];

  const actionCommandColumns: GridColDef[] = [
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 140 },
    { field: 'description', headerName: 'Action', flex: 2, minWidth: 220 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      renderCell: (params) => <StatusChip label={params.value} tone={severityTone(params.value)} />,
    },
    { field: 'estimatedCostFormatted', headerName: 'Budget', width: 110 },
  ];

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        toast('You can compare up to 2 scenarios at once — deselect one first.');
        return prev;
      }
      return [...prev, id];
    });
  }

  const compared = (scenarios ?? []).filter((s) => compareIds.includes(s.id));

  return (
    <Box>
      <HeroBanner
        title="Enterprise Portfolio Command Center"
        description="Executive operating layer for enterprise-wide risk, capital allocation, and strategic planning — scoped to the same 24-building, 3-region portfolio used across every hub."
        badges={['Executive Command', 'Operating Platform']}
        metrics={
          summary
            ? [
                { label: 'Buildings', value: String(summary.buildings) },
                { label: 'Health', value: `${summary.portfolioHealthPct}%` },
              ]
            : []
        }
      />

      <KpiStrip items={kpis} />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Executive Command Dashboard
          </Typography>
          {priority && (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2, bgcolor: '#fffbeb' }}>
              <Typography variant="body2">{priority.description}</Typography>
            </Box>
          )}
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
            {['Escalate Priority Building', 'Convene Risk Committee', 'Request Capital Reallocation', 'Notify Board'].map(
              (label) => (
                <Button key={label} variant="outlined" onClick={() => toast(`${label} — request sent.`)}>
                  {label}
                </Button>
              ),
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Enterprise Portfolio Map
          </Typography>
          {regionsLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
              {(regions ?? []).map((r) => (
                <ScoreCard
                  key={r.id}
                  title={r.name}
                  score={r.healthScore}
                  meta={[
                    { label: 'Buildings', value: String(r.buildingCount) },
                    { label: 'Capital Exposure', value: r.capitalExposure },
                    { label: 'Status', value: r.status },
                  ]}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Enterprise Risk Center
            </Typography>
            <DataTable
              columns={riskCenterColumns}
              rows={(benchmarkMatrix ?? []).slice(0, 6)}
              loading={benchmarkLoading}
              height={320}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Capital Allocation Center
            </Typography>
            <DataTable
              columns={capitalAllocationColumns}
              rows={actionItems ?? []}
              loading={actionLoading}
              height={320}
            />
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Portfolio Health Command
          </Typography>
          {severityItems.length > 0 && <Box sx={{ mb: 2 }}><SeverityTierRow items={severityItems} unit="Buildings" /></Box>}
          {matrixLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : (
            <SeverityMatrix rows={severityMatrix ?? []} />
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Action Command Center
          </Typography>
          <DataTable columns={actionCommandColumns} rows={actionItems ?? []} loading={actionLoading} height={340} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Strategic Planning Center
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
            {(horizons ?? []).map((h) => (
              <Box key={h.key} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {h.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {h.totalCostFormatted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {h.assetCount} components require action
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Executive Scenario Modeling
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Select up to 2 scenarios to compare projected outcomes.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1.5, mb: compared.length === 2 ? 2 : 0 }}>
            {(scenarios ?? []).map((s) => {
              const selected = compareIds.includes(s.id);
              return (
                <Box
                  key={s.id}
                  component="button"
                  type="button"
                  onClick={() => toggleCompare(s.id)}
                  sx={{
                    textAlign: 'left',
                    font: 'inherit',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    p: 2,
                    bgcolor: selected ? '#edf5ff' : '#fff',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {s.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <StatusChip label={`${s.projectedHealthPct}% health`} tone={s.outcomeTone} />
                    <StatusChip label={s.projectedExposureFormatted} tone="neutral" />
                  </Stack>
                </Box>
              );
            })}
          </Box>
          {compared.length === 2 && (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: '#fbfcfe' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                {compared[0].label} vs. {compared[1].label}
              </Typography>
              <Typography variant="body2">
                Health impact: {compared[1].projectedHealthPct - compared[0].projectedHealthPct >= 0 ? '+' : ''}
                {compared[1].projectedHealthPct - compared[0].projectedHealthPct} percentage points
              </Typography>
              <Typography variant="body2">
                Exposure impact:{' '}
                {formatCurrency(Math.abs(compared[1].projectedExposureRaw - compared[0].projectedExposureRaw))}{' '}
                {compared[1].projectedExposureRaw >= compared[0].projectedExposureRaw ? 'higher' : 'lower'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Enterprise Benchmarking
            </Typography>
            <DataTable
              columns={riskCenterColumns}
              rows={benchmarkMatrix ?? []}
              loading={benchmarkLoading}
              height={380}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Executive Board Center
            </Typography>
            <Stack spacing={1.25}>
              {BOARD_PACKAGES.map((pkg) => (
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
                    <Typography variant="caption" color="text.secondary">
                      {pkg.audience} · {pkg.due}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => toast(`${pkg.name} queued for generation.`)}>
                    Generate
                  </Button>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Portfolio Command Workflow
          </Typography>
          <Box sx={{ maxWidth: 320 }}>
            <LineageFlow
              steps={['Risk Identified', 'Executive Review', 'Capital Allocation', 'Board Approval', 'Execution']}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
