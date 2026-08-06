import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import StatusChip, { severityTone } from '../../../shared/components/StatusChip';
import RowActionButton from '../../../shared/components/RowActionButton';
import type { DeficiencyRow } from '../../../api/contracts/operations';
import type { DeficiencySeverity } from '../../../domain/portfolioAssets';
import { useDeficiencies, useDeficiencyStats } from './api';

const SEVERITY_BY_LABEL: Record<string, DeficiencySeverity> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

export default function DeficiencyCenterPage() {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<DeficiencySeverity | null>(null);

  const { data: stats, isLoading: statsLoading } = useDeficiencyStats();
  const { data: deficiencies, isLoading: rowsLoading } = useDeficiencies();

  const kpis: KpiTileData[] = stats
    ? [
        { label: 'Total Deficiencies', value: String(stats.total), tone: 'neutral' },
        { label: 'Critical', value: String(stats.critical), tone: 'error' },
        { label: 'High', value: String(stats.high), tone: 'error' },
        { label: 'Medium', value: String(stats.medium), tone: 'warning' },
        { label: 'Low', value: String(stats.low), tone: 'success' },
        { label: 'Est. Repair Cost', value: stats.estimatedRepairCostFormatted, tone: 'warning' },
        { label: 'Deferred Maintenance Risk', value: String(stats.deferredMaintenanceRisk), tone: 'warning' },
        { label: 'Planned Actions', value: String(stats.plannedActions), tone: 'neutral' },
      ]
    : [];

  const rows = useMemo(
    () => (severityFilter ? (deficiencies ?? []).filter((d) => d.severity === severityFilter) : deficiencies ?? []),
    [deficiencies, severityFilter],
  );

  function handleKpiSelect(item: KpiTileData) {
    if (item.label === 'Total Deficiencies') {
      setSeverityFilter(null);
      return;
    }
    const severity = SEVERITY_BY_LABEL[item.label];
    if (severity) setSeverityFilter((prev) => (prev === severity ? null : severity));
  }

  const columns: GridColDef<DeficiencyRow>[] = [
    { field: 'description', headerName: 'Deficiency', flex: 1.4, minWidth: 220 },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'systemName', headerName: 'System', flex: 1, minWidth: 150 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      renderCell: (params) => <StatusChip label={params.value} tone={severityTone(params.value)} />,
    },
    { field: 'estimatedCostFormatted', headerName: 'Est. Cost', width: 110 },
    { field: 'recommendedAction', headerName: 'Recommended Action', flex: 1.2, minWidth: 200 },
    {
      field: 'goToAction',
      headerName: '',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <RowActionButton
          label="View Action"
          onClick={() =>
            navigate(
              params.row.recommendedActionId
                ? `/portal/actions?highlight=${params.row.recommendedActionId}`
                : '/portal/actions',
            )
          }
        />
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h5">Deficiency Center</Typography>
        <Chip label="Risk Intelligence" size="small" />
      </Stack>

      {statsLoading ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Loading…
        </Typography>
      ) : (
        <KpiStrip items={kpis} onSelect={handleKpiSelect} />
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6">Deficiency Dashboard</Typography>
            {severityFilter && (
              <Chip
                label={`Filtered: ${severityFilter}`}
                size="small"
                onDelete={() => setSeverityFilter(null)}
              />
            )}
          </Stack>
          <DataTable columns={columns} rows={rows} loading={rowsLoading} height={480} />
        </CardContent>
      </Card>
    </Box>
  );
}
