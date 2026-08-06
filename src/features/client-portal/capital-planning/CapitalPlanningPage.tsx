import { useMemo, useState } from 'react';
import { Box, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import StatusChip, { severityTone } from '../../../shared/components/StatusChip';
import type { CapitalPlanRow } from '../../../api/contracts/capitalPlan';
import type { CapitalPlanStatus } from '../../../domain/capitalPlan';
import { useCapitalForecastHorizons } from '../api';
import { useCapitalPlanRows, useCapitalPlanStats } from './api';

const STATUS_TONE: Record<CapitalPlanStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  funded: 'success',
  inProgress: 'warning',
  unfunded: 'error',
  complete: 'success',
};

const STATUS_LABEL: Record<CapitalPlanStatus, string> = {
  funded: 'Funded',
  inProgress: 'In Progress',
  unfunded: 'Unfunded',
  complete: 'Complete',
};

export default function CapitalPlanningPage() {
  const [yearFilter, setYearFilter] = useState('');

  const { data: horizons } = useCapitalForecastHorizons();
  const { data: stats } = useCapitalPlanStats();
  const { data: rows, isLoading } = useCapitalPlanRows();

  const years = useMemo(() => [...new Set((rows ?? []).map((r) => r.year))].sort(), [rows]);
  const filteredRows = useMemo(
    () => (yearFilter ? (rows ?? []).filter((r) => String(r.year) === yearFilter) : rows ?? []),
    [rows, yearFilter],
  );

  const horizonByKey = new Map((horizons ?? []).map((h) => [h.key, h]));

  const kpis: KpiTileData[] = stats
    ? [
        { label: 'Immediate (0-1 yr)', value: horizonByKey.get('immediate')?.totalCostFormatted ?? '—', tone: 'error' },
        { label: '5-Year Forecast', value: horizonByKey.get('5yr')?.totalCostFormatted ?? '—', tone: 'warning' },
        { label: '10-Year Forecast', value: horizonByKey.get('10yr')?.totalCostFormatted ?? '—', tone: 'neutral' },
        { label: '30-Year Forecast', value: horizonByKey.get('30yr')?.totalCostFormatted ?? '—', tone: 'neutral' },
        { label: 'Reserve Funding Gap', value: stats.reserveFundingGapFormatted, tone: 'warning' },
        { label: 'Funded Projects', value: String(stats.fundedCount), tone: 'success' },
        { label: 'Unfunded Projects', value: String(stats.unfundedCount), tone: 'error' },
        { label: 'High Priority', value: String(stats.highPriorityCount), tone: 'error' },
      ]
    : [];

  const columns: GridColDef<CapitalPlanRow>[] = [
    { field: 'year', headerName: 'Year', width: 90, type: 'number' },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'systemName', headerName: 'System', flex: 1, minWidth: 150 },
    { field: 'recommendedWork', headerName: 'Recommended Work', flex: 1.2, minWidth: 180 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => <StatusChip label={params.value} tone={severityTone(params.value)} />,
    },
    { field: 'forecastCostFormatted', headerName: 'Forecast Cost', width: 130 },
    { field: 'fundingSource', headerName: 'Funding Source', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip label={STATUS_LABEL[params.value as CapitalPlanStatus]} tone={STATUS_TONE[params.value as CapitalPlanStatus]} />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        Capital Planning Center
      </Typography>

      <KpiStrip items={kpis} />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Capital Plan</Typography>
            <TextField
              select
              label="Year"
              size="small"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All years</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={String(y)}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <DataTable columns={columns} rows={filteredRows} loading={isLoading} height={520} />
        </CardContent>
      </Card>
    </Box>
  );
}
