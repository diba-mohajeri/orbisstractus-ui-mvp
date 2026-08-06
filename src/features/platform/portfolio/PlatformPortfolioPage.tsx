import { useState } from 'react';
import { Box, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DataTable from '../../../shared/components/DataTable';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import KpiStrip from '../../../shared/components/KpiStrip';
import StatusChip, { healthTone, riskTone, severityTone } from '../../../shared/components/StatusChip';
import type { HealthTier, RiskLevel } from '../../../domain/portfolioAssets';
import { useBuildingSummaries, useDeficienciesForBuilding } from '../../client-portal/api';
import { useAssetRegistryDetail } from '../../client-portal/asset-registry/api';
import { useCompanies } from '../api';
import { pageTitleSx, subsectionTitleSx } from '../../insightx/shared/pageStyles';

const HEALTH_TIER_OPTIONS: HealthTier[] = ['healthy', 'monitor', 'atRisk', 'critical'];
const RISK_LEVEL_OPTIONS: RiskLevel[] = ['low', 'medium', 'high'];

export default function PlatformPortfolioPage() {
  const { data: buildings, isLoading } = useBuildingSummaries();
  const { data: companies } = useCompanies();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const { data: detail } = useAssetRegistryDetail(selectedBuildingId);
  const { data: deficiencies } = useDeficienciesForBuilding(selectedBuildingId);

  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState<HealthTier | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const allRows = (buildings ?? []).map((b) => ({
    ...b,
    companyLabel: companyName.get(b.companyId) ?? b.companyId,
  }));
  const regionOptions = [...new Set(allRows.map((b) => b.regionName))].sort();

  const rows = allRows.filter((b) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || b.name.toLowerCase().includes(term) || b.address.toLowerCase().includes(term);
    const matchesCompany = companyFilter === 'all' || b.companyId === companyFilter;
    const matchesRegion = regionFilter === 'all' || b.regionName === regionFilter;
    const matchesHealth = healthFilter === 'all' || b.healthTier === healthFilter;
    const matchesRisk = riskFilter === 'all' || b.riskLevel === riskFilter;
    return matchesSearch && matchesCompany && matchesRegion && matchesHealth && matchesRisk;
  });

  return (
    <Box>
      <Typography component="h1" sx={{ ...pageTitleSx, mb: 0.5 }}>
        Portfolio
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Every building across every company on Orbisstractus, with real health, risk, and capital exposure data.
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Company"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All Companies</MenuItem>
          {(companies ?? []).map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Region"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Regions</MenuItem>
          {regionOptions.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Health"
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as HealthTier | 'all')}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">All Health Tiers</MenuItem>
          {HEALTH_TIER_OPTIONS.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Risk"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="all">All Risk Levels</MenuItem>
          {RISK_LEVEL_OPTIONS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {rows.length} of {allRows.length} buildings
        </Typography>
      </Stack>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable
            loading={isLoading}
            columns={[
              { field: 'name', headerName: 'Building', flex: 1, minWidth: 160 },
              { field: 'companyLabel', headerName: 'Company', width: 190 },
              { field: 'regionName', headerName: 'Region', width: 140 },
              {
                field: 'healthTier',
                headerName: 'Health',
                width: 120,
                renderCell: (params) => <StatusChip label={String(params.value)} tone={healthTone(params.value as HealthTier)} />,
              },
              {
                field: 'riskLevel',
                headerName: 'Risk',
                width: 110,
                renderCell: (params) => <StatusChip label={String(params.value)} tone={riskTone(params.value as RiskLevel)} />,
              },
              { field: 'capitalExposureFormatted', headerName: 'Capital Exposure', width: 150 },
            ]}
            rows={rows}
            height={520}
            onRowClick={(row) => setSelectedBuildingId(row.id)}
          />
        </CardContent>
      </Card>

      <DetailDrawer
        open={Boolean(selectedBuildingId)}
        onClose={() => setSelectedBuildingId(null)}
        title={detail?.building.name ?? 'Building'}
        subtitle={detail ? `${companyName.get(detail.building.companyId) ?? ''} · ${detail.building.address}` : undefined}
      >
        {detail && (
          <Stack spacing={2.5}>
            <KpiStrip
              items={[
                { label: 'Health', value: `${detail.building.healthPct}%`, tone: detail.building.healthPct >= 70 ? 'success' : 'warning' },
                { label: 'Risk', value: detail.building.riskLevel, tone: detail.building.riskLevel === 'high' ? 'error' : 'neutral' },
                { label: 'Capital Exposure', value: detail.building.capitalExposureFormatted },
                { label: 'Deficiencies', value: String(deficiencies?.length ?? 0) },
              ]}
            />

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Building</Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">Client: {detail.building.clientOrganization}</Typography>
                <Typography variant="body2">Occupancy: {detail.building.occupancyType}</Typography>
                <Typography variant="body2">Structure / Envelope: {detail.building.structureType} · {detail.building.envelopeType}</Typography>
                <Typography variant="body2">Year Built: {detail.building.yearBuilt} · {detail.building.storeys} storeys</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Top Asset Records</Typography>
              {detail.topAssets.length > 0 ? (
                <Stack spacing={1}>
                  {detail.topAssets.map((a) => (
                    <Box key={a.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.component} — {a.systemName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.condition} condition · {a.remainingUsefulLifeYears} yrs RUL
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No asset records on file.</Typography>
              )}
            </Box>

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Deficiencies</Typography>
              {deficiencies && deficiencies.length > 0 ? (
                <Stack spacing={1}>
                  {deficiencies.map((d) => (
                    <Box key={d.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25, gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.systemName}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.description}</Typography>
                      </Box>
                      <StatusChip label={d.severity} tone={severityTone(d.severity)} />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No deficiencies on file.</Typography>
              )}
            </Box>
          </Stack>
        )}
      </DetailDrawer>
    </Box>
  );
}
