import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import HeroBanner from '../../../shared/components/HeroBanner';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import LineageFlow from '../../../shared/components/LineageFlow';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import StatusChip, { conditionTone, riskTone } from '../../../shared/components/StatusChip';
import { formatCurrency } from '../../../shared/utils/format';
import { CANONICAL_SYSTEM_NAMES, type AssetRecord } from '../../../domain/portfolioAssets';
import AssetDetailPanel from './AssetDetailPanel';
import { useAssetRecords, useAssetStats, useBuildingSummaries, useBuildingSystems } from '../api';
import { useRiskPriority } from './api';

const HEALTH_TIER_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  monitor: 'Monitor',
  atRisk: 'At Risk',
  critical: 'Critical',
};

export default function AssetManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const regionFilter = searchParams.get('region') ?? undefined;
  const healthFilter = searchParams.get('health') ?? undefined;

  const [buildingId, setBuildingId] = useState('');
  const [systemName, setSystemName] = useState('');
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [matrixBuildingId, setMatrixBuildingId] = useState('');

  const { data: stats, isLoading: statsLoading } = useAssetStats();
  const { data: buildings } = useBuildingSummaries();
  const { data: riskList, isLoading: riskLoading } = useRiskPriority(8);

  const buildingNameById = useMemo(() => {
    const map = new Map<string, string>();
    (buildings ?? []).forEach((b) => map.set(b.id, b.name));
    return map;
  }, [buildings]);

  const effectiveMatrixBuildingId = matrixBuildingId || buildings?.[0]?.id || '';
  const { data: matrixSystems } = useBuildingSystems(effectiveMatrixBuildingId || null);

  const assetQuery = useAssetRecords({
    buildingId: buildingId || undefined,
    regionId: regionFilter,
    healthTier: healthFilter,
    systemName: systemName || undefined,
    search: search || undefined,
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    sortField: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort ?? undefined,
  });

  function clearScopeFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete('region');
    next.delete('health');
    setSearchParams(next);
  }

  const kpis: KpiTileData[] = stats
    ? [
        { label: 'Total Assets', value: String(stats.totalAssets), tone: 'neutral' },
        { label: 'Total Asset Value', value: stats.totalValue, tone: 'neutral' },
        { label: 'High-Risk Assets', value: String(stats.highRiskAssets), tone: 'error' },
        { label: 'Avg. Remaining Useful Life', value: `${stats.avgRemainingUsefulLife} yrs`, tone: 'neutral' },
        { label: 'Buildings Tracked', value: String(stats.buildingsTracked), tone: 'neutral' },
        { label: 'Systems Tracked', value: String(stats.systemsTracked), tone: 'neutral' },
      ]
    : [];

  const registerRows = (assetQuery.data?.rows ?? []).map((r) => ({
    ...r,
    buildingName: buildingNameById.get(r.buildingId) ?? r.buildingId,
  }));

  const riskRows = (riskList ?? []).map((r) => ({
    ...r,
    buildingName: buildingNameById.get(r.buildingId) ?? r.buildingId,
  }));

  const assetColumns: GridColDef[] = [
    { field: 'id', headerName: 'Asset ID', width: 100 },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 140 },
    { field: 'systemName', headerName: 'System', flex: 1, minWidth: 160 },
    { field: 'component', headerName: 'Component', flex: 1, minWidth: 160 },
    {
      field: 'condition',
      headerName: 'Condition',
      width: 110,
      renderCell: (params) => <StatusChip label={params.value} tone={conditionTone(params.value)} />,
    },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => <StatusChip label={params.value} tone={riskTone(params.value)} />,
    },
    { field: 'remainingUsefulLifeYears', headerName: 'RUL (yrs)', width: 100, type: 'number' },
    {
      field: 'replacementCost',
      headerName: 'Repl. Cost',
      width: 120,
      renderCell: (params) => formatCurrency(params.value as number),
    },
  ];

  function openAsset(row: AssetRecord) {
    setSelectedAssetId(row.id);
  }

  const selectedAsset = registerRows.find((r) => r.id === selectedAssetId) ?? riskRows.find((r) => r.id === selectedAssetId);

  return (
    <Box>
      <HeroBanner
        title="Portfolio & Asset Management Hub"
        description="Manage structured asset records across portfolio, region, building, system, and component levels — from the full asset register down to individual component risk and remaining useful life."
        badges={['Asset Master Data', 'Digital Twin Foundation']}
        metrics={
          stats
            ? [
                { label: 'Total Assets', value: String(stats.totalAssets) },
                { label: 'Total Value', value: stats.totalValue },
              ]
            : []
        }
      />

      {statsLoading ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Loading asset statistics…
        </Typography>
      ) : (
        <KpiStrip items={kpis} />
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Portfolio Hierarchy
          </Typography>
          <Box sx={{ maxWidth: 320 }}>
            <LineageFlow steps={['Portfolio', 'Region', 'Building', 'System', 'Component', 'Asset Record']} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Asset Master Register
          </Typography>

          {(regionFilter || healthFilter) && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Scoped from Portfolio Hub:
              </Typography>
              {regionFilter && <Chip size="small" label={`Region: ${regionFilter}`} />}
              {healthFilter && <Chip size="small" label={`Health: ${HEALTH_TIER_LABELS[healthFilter] ?? healthFilter}`} />}
              <Chip size="small" label="Clear" onClick={clearScopeFilter} variant="outlined" />
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1.5 }}>
            <TextField
              select
              label="Building"
              size="small"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All buildings</MenuItem>
              {(buildings ?? []).map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="System"
              size="small"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All systems</MenuItem>
              {CANONICAL_SYSTEM_NAMES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Search component or asset ID"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 220 }}
            />
          </Stack>

          <DataTable
            columns={assetColumns}
            rows={registerRows}
            loading={assetQuery.isLoading}
            paginationMode="server"
            rowCount={assetQuery.data?.totalCount ?? 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onRowClick={openAsset}
            height={460}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Building System Health Matrix
          </Typography>
          <TextField
            select
            label="Building"
            size="small"
            value={effectiveMatrixBuildingId}
            onChange={(e) => setMatrixBuildingId(e.target.value)}
            sx={{ minWidth: 220, mb: 2 }}
          >
            {(buildings ?? []).map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1.25 }}>
            {(matrixSystems ?? []).map((system) => (
              <Box
                key={system.id}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5, bgcolor: '#fbfcfe' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {system.systemName}
                </Typography>
                <StatusChip
                  label={system.status}
                  tone={system.status === 'good' ? 'success' : system.status === 'fair' ? 'warning' : 'error'}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Asset Risk &amp; Prioritization
          </Typography>
          <DataTable
            columns={assetColumns}
            rows={riskRows}
            loading={riskLoading}
            onRowClick={openAsset}
            height={360}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Linked Intelligence
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {['Digital Twin Hub', 'Predictive Analytics', 'Capital Planning', 'Report Center', 'Deficiency Center'].map(
              (label) => (
                <Chip key={label} label={label} size="small" />
              ),
            )}
          </Stack>
        </CardContent>
      </Card>

      <DetailDrawer
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAssetId(null)}
        title={selectedAsset ? selectedAsset.id : ''}
        subtitle={selectedAsset ? selectedAsset.component : undefined}
      >
        {selectedAsset && (
          <AssetDetailPanel asset={selectedAsset} buildingName={buildingNameById.get(selectedAsset.buildingId) ?? selectedAsset.buildingId} />
        )}
      </DetailDrawer>
    </Box>
  );
}
