import { Box, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import HeroBanner from '../../../shared/components/HeroBanner';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import SeverityTierRow, { type SeverityTierItem } from '../../../shared/components/SeverityTierRow';
import StatusChip, { riskTone } from '../../../shared/components/StatusChip';
import { useHealthTierCounts, usePortfolioSummary, useRegionSummaries } from '../api';
import { usePortfolioAnalytics } from './api';
import type { RegionSummaryResponse } from '../../../api/contracts/portfolioAssets';

export default function PortfolioHubPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary();
  const { data: regions, isLoading: regionsLoading } = useRegionSummaries();
  const { data: healthTiers, isLoading: healthLoading } = useHealthTierCounts();
  const { data: analytics, isLoading: analyticsLoading } = usePortfolioAnalytics();

  const kpis: KpiTileData[] = summary
    ? [
        { label: 'Buildings', value: String(summary.buildings), tone: 'neutral' },
        { label: 'Projects', value: String(summary.activeProjects), tone: 'neutral' },
        { label: 'Open Deficiencies', value: String(summary.openDeficiencies), tone: 'warning' },
        { label: 'Portfolio Health', value: `${summary.portfolioHealthPct}%`, tone: 'success' },
        { label: 'Capital Exposure', value: summary.capitalForecast30yr, tone: 'warning' },
        { label: 'Reserve Requirements', value: summary.reserveRequirements, tone: 'neutral' },
        { label: 'Active Assessments', value: String(summary.activeAssessments), tone: 'neutral' },
        { label: 'Upcoming Projects', value: String(summary.upcomingProjects), tone: 'neutral' },
      ]
    : [];

  const regionColumns: GridColDef<RegionSummaryResponse>[] = [
    { field: 'name', headerName: 'Portfolio', flex: 1, minWidth: 120 },
    { field: 'region', headerName: 'Region', width: 100, valueGetter: () => 'Ontario' },
    { field: 'buildingCount', headerName: 'Buildings', width: 100, type: 'number' },
    { field: 'assetClass', headerName: 'Asset Class', width: 130 },
    {
      field: 'riskRating',
      headerName: 'Risk Rating',
      width: 130,
      renderCell: (params) => <StatusChip label={params.value} tone={riskTone(params.value)} />,
    },
    { field: 'capitalExposure', headerName: 'Capital Exposure', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <StatusChip label={params.value} tone={params.value === 'active' ? 'success' : 'warning'} />
      ),
    },
  ];

  const analyticsCards = analytics
    ? [
        { title: analytics.topRegion.name, subtitle: 'Buildings by Region', value: `${analytics.topRegion.count} assets` },
        { title: analytics.topAssetClass.name, subtitle: 'Buildings by Class', value: `${analytics.topAssetClass.count} assets` },
        { title: `${analytics.atRiskCount} At Risk`, subtitle: 'Buildings by Risk Level', value: '' },
        { title: analytics.topExposure.value, subtitle: 'Highest Capital Exposure', value: analytics.topExposure.name },
        { title: `${analytics.activeCount} Active`, subtitle: 'Buildings by Status', value: '' },
        { title: `${analytics.upcomingAssessments} Planned`, subtitle: 'Upcoming Assessments', value: '' },
      ]
    : [];

  const severityItems: SeverityTierItem[] = (healthTiers ?? []).map((t) => ({
    key: t.tier,
    label: t.label,
    count: t.count,
    description: t.description,
    tone: t.tier === 'healthy' ? 'success' : t.tier === 'monitor' ? 'neutral' : t.tier === 'atRisk' ? 'warning' : 'error',
  }));

  return (
    <Box>
      <HeroBanner
        title="Portfolio Hub"
        description="Enterprise portfolio management view for owners managing one building, fifty buildings, or 500+ assets. Portfolio intelligence is organized by region, asset class, risk level, capital exposure, and service status."
        badges={['Enterprise Portfolio Management', 'Scalable Client Portal']}
        metrics={
          summary
            ? [
                { label: 'Total Buildings', value: String(summary.buildings) },
                { label: 'Total Capital', value: summary.capitalForecast30yr },
              ]
            : []
        }
      />

      {summaryLoading ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Loading portfolio KPIs…
        </Typography>
      ) : (
        <KpiStrip items={kpis} />
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Portfolio Summary
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Click a row to view that portfolio's assets in Portfolio &amp; Asset Management.
            </Typography>
            <DataTable
              columns={regionColumns}
              rows={regions ?? []}
              loading={regionsLoading}
              height={260}
              onRowClick={(row) => navigate(`/portal/asset-management?region=${row.id}`)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Portfolio Analytics
            </Typography>
            {analyticsLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                {analyticsCards.map((card) => (
                  <Box
                    key={card.subtitle}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5, bgcolor: '#fbfcfe' }}
                  >
                    <Typography sx={{ fontWeight: 900 }}>{card.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {card.subtitle}
                    </Typography>
                    {card.value && (
                      <Typography variant="caption" color="text.secondary">
                        {card.value}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Portfolio Health View
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Click a tier to view that filtered list in Portfolio &amp; Asset Management.
      </Typography>
      {healthLoading ? (
        <Typography color="text.secondary">Loading…</Typography>
      ) : (
        <SeverityTierRow
          items={severityItems}
          unit="Buildings"
          onSelect={(item) => navigate(`/portal/asset-management?health=${item.key}`)}
        />
      )}
    </Box>
  );
}
