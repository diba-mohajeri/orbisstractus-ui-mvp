import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../../../shared/components/HeroBanner';
import StatusChip, { healthTone, riskTone } from '../../../shared/components/StatusChip';
import RuleStatusList from '../../../shared/components/RuleStatusList';
import { formatCurrency } from '../../../shared/utils/format';
import { useToast } from '../../../shared/store/toastStore';
import { usePortfolioSummary, useBuildingSummaries } from '../api';
import { useAssetRegistryDetail } from './api';

const PARTNER_ACCESS = [
  { rule: 'Property Manager', status: 'Full Access', tone: 'success' as const },
  { rule: 'Board Member', status: 'Reports & Summaries', tone: 'neutral' as const },
  { rule: 'Asset Manager', status: 'Full Access + Capital Planning', tone: 'success' as const },
  { rule: 'External Auditor', status: 'Read-Only Reports', tone: 'warning' as const },
];

export default function AssetRegistryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: summary } = usePortfolioSummary();
  const { data: buildings, isLoading: buildingsLoading } = useBuildingSummaries();
  const activeId = selectedId ?? buildings?.[0]?.id ?? null;
  const { data: detail, isLoading: detailLoading } = useAssetRegistryDetail(activeId);

  const highPriorityCount = (buildings ?? []).filter(
    (b) => b.healthTier === 'atRisk' || b.healthTier === 'critical',
  ).length;

  return (
    <Box>
      <HeroBanner
        title="Asset Registry"
        description="Browse building, system, component, inspection history, and report relationships across the portfolio."
        metrics={
          summary
            ? [
                { label: 'Total Assets', value: String(summary.buildings) },
                { label: 'Planning Exposure', value: summary.capitalForecast30yr },
                { label: 'High-Priority', value: String(highPriorityCount) },
                { label: 'Shared Partners', value: String(PARTNER_ACCESS.length) },
              ]
            : []
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1.6fr 260px' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800 }}>
              Asset Portfolio
            </Typography>
            {buildingsLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading…
              </Typography>
            ) : (
              <Stack spacing={1}>
                {(buildings ?? []).map((b) => {
                  const isSelected = b.id === activeId;
                  return (
                    <Box
                      key={b.id}
                      component="button"
                      type="button"
                      onClick={() => setSelectedId(b.id)}
                      sx={{
                        textAlign: 'left',
                        font: 'inherit',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        bgcolor: isSelected ? '#edf5ff' : '#fff',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {b.name}
                      </Typography>
                      <StatusChip label={b.status} tone={healthTone(b.healthTier)} />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Asset Detail
            </Typography>
            {detailLoading || !detail ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {detail.building.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {detail.building.address}
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Condition
                    </Typography>
                    <StatusChip label={`${detail.building.healthPct}%`} tone={healthTone(detail.building.healthTier)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Primary Risk
                    </Typography>
                    <StatusChip label={detail.building.riskLevel} tone={riskTone(detail.building.riskLevel)} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Latest Report
                    </Typography>
                    <Typography variant="body2">
                      {detail.latestReport ? `${detail.latestReport.serviceLine} (${detail.latestReport.releaseDate})` : 'None released'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Capital Planning
                    </Typography>
                    <Typography variant="body2">{detail.building.capitalExposureFormatted}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Shared Visibility
                    </Typography>
                    <Typography variant="body2">Board + Property Manager</Typography>
                  </Box>
                </Stack>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Inspection Highlights
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1, mb: 2 }}>
                  {detail.topAssets.map((asset) => (
                    <Box key={asset.id} sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 1 }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                        {asset.component}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(asset.replacementCost)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(
                        detail.latestReport
                          ? `/report-viewer/${detail.latestReport.id}?mode=preview&from=client`
                          : `/portal/reports?building=${detail.building.id}`,
                      )
                    }
                  >
                    Open Latest Report Preview
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => toast('Execution Management (ExecutionX) is a future platform bridge — not yet available.')}
                  >
                    View Execution Management
                  </Button>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800 }}>
              Partner Collaboration Layer
            </Typography>
            <Alert severity="info" sx={{ mb: 1.5, fontSize: 13 }}>
              Data shown here reflects released records only.
            </Alert>
            <Alert severity="success" sx={{ mb: 2, fontSize: 13 }}>
              Access is scoped per partner role below.
            </Alert>
            <RuleStatusList items={PARTNER_ACCESS} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
