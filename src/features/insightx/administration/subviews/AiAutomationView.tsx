import { Box, Card, CardContent, Typography } from '@mui/material';
import AIDisclaimerBanner from '../../../../shared/components/AIDisclaimerBanner';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import StatusChip from '../../../../shared/components/StatusChip';
import { useAssetStats, usePortfolioSummary } from '../../../client-portal/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const CAPABILITIES = [
  { name: 'AI-Assisted Inspections', status: 'Pilot' as const },
  { name: 'AI Scope Recommendation', status: 'Pilot' as const },
  { name: 'AI Report Generation', status: 'Human Review Gate' as const },
  { name: 'AI Quality Review', status: 'Human Review Gate' as const },
  { name: 'AI Reserve Forecasting', status: 'Pilot' as const },
  { name: 'AI Workflow Automation', status: 'Configured' as const },
];

export default function AiAutomationView() {
  const { data: summary } = usePortfolioSummary();
  const { data: assetStats } = useAssetStats();

  const kpis: KpiTileData[] = [
    { label: 'Buildings Benchmarked', value: String(summary?.buildings ?? '—'), tone: 'neutral' },
    { label: 'Components Analyzed', value: String(assetStats?.totalAssets ?? '—'), tone: 'neutral' },
    { label: 'AI Capabilities Active', value: String(CAPABILITIES.length), tone: 'success' },
    { label: 'Human Review Gates', value: String(CAPABILITIES.filter((c) => c.status === 'Human Review Gate').length), tone: 'warning' },
  ];

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        AI &amp; Automation Hub
      </Typography>
      <AIDisclaimerBanner message="Every AI capability listed below writes to a human-reviewed gate (Analyst approval, QA sign-off, or P.Eng seal) before it affects a client-facing record. AI decisions are logged to the Audit Trail." />
      <KpiStrip items={kpis} />

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
            AI Capability Catalog
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.25 }}>
            {CAPABILITIES.map((c) => (
              <Box key={c.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {c.name}
                </Typography>
                <StatusChip label={c.status} tone={c.status === 'Configured' ? 'success' : 'warning'} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
