import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import HeroBanner from '../../../shared/components/HeroBanner';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import EntitySelector, { type EntitySelectorOption } from '../../../shared/components/EntitySelector';
import AIDisclaimerBanner from '../../../shared/components/AIDisclaimerBanner';
import RuleStatusList from '../../../shared/components/RuleStatusList';
import StatusChip, { conditionTone, healthTone, riskTone, severityTone } from '../../../shared/components/StatusChip';
import { formatCurrency } from '../../../shared/utils/format';
import {
  useAssetRecords,
  useAssetStats,
  useBuildingSummaries,
  useBuildingSystems,
  useDeficienciesForBuilding,
  usePortfolioSummary,
} from '../api';

const EVIDENCE_CATEGORIES = [
  'Photos',
  'Drone Imagery',
  'Thermal Scans',
  'Field Notes',
  'Drawings',
  'Engineering Letters',
  'Checklists',
  'Appendices',
];

const GOVERNANCE_RULES = [
  { rule: 'Draft observations hidden until QA approved', status: 'Enforced' },
  { rule: 'Client sees only released findings and reports', status: 'Enforced' },
  { rule: 'Photo evidence linked only to approved observations', status: 'Enforced' },
  { rule: 'Change history is append-only and fully auditable', status: 'Enforced' },
];

export default function DigitalTwinPage() {
  const [searchParams] = useSearchParams();
  const buildingParam = searchParams.get('building');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const { data: portfolioSummary } = usePortfolioSummary();
  const { data: assetStats } = useAssetStats();
  const { data: buildings, isLoading: buildingsLoading } = useBuildingSummaries();

  const activeBuildingId = selectedBuildingId ?? buildingParam ?? buildings?.[0]?.id ?? null;
  const selectedBuilding = buildings?.find((b) => b.id === activeBuildingId) ?? null;

  const { data: systems, isLoading: systemsLoading } = useBuildingSystems(activeBuildingId);
  const { data: deficiencies, isLoading: deficienciesLoading } = useDeficienciesForBuilding(activeBuildingId);
  const componentQuery = useAssetRecords({
    buildingId: activeBuildingId ?? undefined,
    page: 0,
    pageSize: 200,
  });

  const componentRows = componentQuery.data?.rows ?? [];

  const topCapitalNeeds = useMemo(
    () => [...componentRows].sort((a, b) => b.replacementCost - a.replacementCost).slice(0, 3),
    [componentRows],
  );

  const riskiestSystem = useMemo(() => {
    const counts = new Map<string, number>();
    componentRows.forEach((r) => {
      if (r.riskLevel === 'high') counts.set(r.systemName, (counts.get(r.systemName) ?? 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0];
  }, [componentRows]);

  const selectorOptions: EntitySelectorOption[] = (buildings ?? []).map((b) => ({
    id: b.id,
    title: b.name,
    meta: [
      { label: `${b.healthPct}% health`, tone: healthTone(b.healthTier) },
      { label: `${b.riskLevel} risk`, tone: riskTone(b.riskLevel) },
      { label: b.capitalExposureFormatted },
    ],
  }));

  const kpis: KpiTileData[] = assetStats && portfolioSummary
    ? [
        { label: 'Buildings', value: String(portfolioSummary.buildings), tone: 'neutral' },
        { label: 'Systems Tracked', value: String(assetStats.systemsTracked), tone: 'neutral' },
        { label: 'Components Tracked', value: String(assetStats.totalAssets), tone: 'neutral' },
        { label: 'High-Risk Components', value: String(assetStats.highRiskAssets), tone: 'error' },
        { label: 'Avg. Remaining Useful Life', value: `${assetStats.avgRemainingUsefulLife} yrs`, tone: 'neutral' },
        { label: 'Portfolio Health', value: `${portfolioSummary.portfolioHealthPct}%`, tone: 'success' },
      ]
    : [];

  const componentColumns: GridColDef[] = [
    { field: 'id', headerName: 'Asset ID', width: 100 },
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
  ];

  const deficiencyColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'systemName', headerName: 'System', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 220 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      renderCell: (params) => <StatusChip label={params.value} tone={severityTone(params.value)} />,
    },
    {
      field: 'estimatedCost',
      headerName: 'Est. Cost',
      width: 120,
      renderCell: (params) => formatCurrency(params.value as number),
    },
  ];

  return (
    <Box>
      <HeroBanner
        title="Digital Twin Hub"
        description="Explore connected building twins that link systems, components, condition, deficiencies, and evidence into one living record. Select a building below to scope every panel on this page to that twin."
        badges={['Living Building Record', 'Predictive Foundation']}
        metrics={
          buildings
            ? [
                { label: 'Buildings', value: String(buildings.length) },
                { label: 'Systems', value: assetStats ? String(assetStats.systemsTracked) : '—' },
              ]
            : []
        }
      />

      {kpis.length > 0 && <KpiStrip items={kpis} />}

      <Typography variant="h6" sx={{ mb: 1 }}>
        Building Twin Selector
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Selecting a building scopes the system map, component intelligence, deficiencies, and
        insights below to that twin.
      </Typography>
      {buildingsLoading ? (
        <Typography color="text.secondary">Loading buildings…</Typography>
      ) : (
        <EntitySelector
          options={selectorOptions}
          selectedId={activeBuildingId}
          onSelect={(id) => setSelectedBuildingId(id)}
        />
      )}

      {selectedBuilding && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Twin System Map — {selectedBuilding.name}
              </Typography>
              {systemsLoading ? (
                <Typography color="text.secondary">Loading systems…</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1.25 }}>
                  {(systems ?? []).map((system) => (
                    <Box
                      key={system.id}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5, bgcolor: '#fbfcfe' }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                        {system.systemName}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                        <StatusChip
                          label={system.status}
                          tone={system.status === 'good' ? 'success' : system.status === 'fair' ? 'warning' : 'error'}
                        />
                        <StatusChip label={`${system.completenessPct}% complete`} tone="neutral" />
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2, mb: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Component Intelligence
                </Typography>
                <DataTable
                  columns={componentColumns}
                  rows={componentRows}
                  loading={componentQuery.isLoading}
                  height={360}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Visual Evidence Layer
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {EVIDENCE_CATEGORIES.map((category) => (
                    <Box
                      key={category}
                      sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 1.25, textAlign: 'center' }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {category}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Full evidence capture and linkage ships with the Document Vault integration
                  (Phase 5).
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2, mb: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Deficiency Overlay
                </Typography>
                <DataTable
                  columns={deficiencyColumns}
                  rows={deficiencies ?? []}
                  loading={deficienciesLoading}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Lifecycle &amp; Capital Overlay
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Top capital needs for this twin, by replacement cost.
                </Typography>
                <Stack spacing={1}>
                  {topCapitalNeeds.map((asset) => (
                    <Box
                      key={asset.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {asset.component}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.systemName}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {formatCurrency(asset.replacementCost)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                AI Twin Insights
              </Typography>
              <AIDisclaimerBanner />
              <Stack spacing={1}>
                {riskiestSystem && (
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="body2">
                      <strong>{riskiestSystem[0]}</strong> has the most high-risk components in this
                      twin ({riskiestSystem[1]}). Consider prioritizing inspection follow-up.
                    </Typography>
                  </Box>
                )}
                {topCapitalNeeds[0] && (
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="body2">
                      Largest single capital need: <strong>{topCapitalNeeds[0].component}</strong> at{' '}
                      {formatCurrency(topCapitalNeeds[0].replacementCost)}.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Digital Twin Governance
                </Typography>
                <RuleStatusList items={GOVERNANCE_RULES} />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Twin Detail Panel
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>{selectedBuilding.name}</strong> — {selectedBuilding.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBuilding.regionName} · {selectedBuilding.assetClass}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    <StatusChip label={`${selectedBuilding.healthPct}% health`} tone={healthTone(selectedBuilding.healthTier)} />
                    <StatusChip label={`${selectedBuilding.riskLevel} risk`} tone={riskTone(selectedBuilding.riskLevel)} />
                    <StatusChip label={selectedBuilding.status} tone="neutral" />
                  </Stack>
                  <Typography variant="body2">
                    Capital exposure: <strong>{selectedBuilding.capitalExposureFormatted}</strong>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
}
