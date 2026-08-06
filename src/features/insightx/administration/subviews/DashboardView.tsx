import { Box, Card, CardContent, Typography } from '@mui/material';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import StatusChip from '../../../../shared/components/StatusChip';
import { useAuditLogStore } from '../../../../shared/store/auditLogStore';
import { useAssetStats, usePortfolioSummary } from '../../../client-portal/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

export default function DashboardView() {
  const { data: summary } = usePortfolioSummary();
  const { data: assetStats } = useAssetStats();
  const events = useAuditLogStore((s) => s.events);

  const kpis: KpiTileData[] = summary
    ? [
        { label: 'Buildings', value: String(summary.buildings), tone: 'neutral' },
        { label: 'Active Projects', value: String(summary.activeProjects), tone: 'neutral' },
        { label: 'Portfolio Health', value: `${summary.portfolioHealthPct}%`, tone: 'success' },
        { label: 'Assets Tracked', value: String(assetStats?.totalAssets ?? '—'), tone: 'neutral' },
      ]
    : [];

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        SaaS Dashboard
      </Typography>
      <KpiStrip items={kpis} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Platform Health
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">API Uptime</Typography>
              <StatusChip label="99.98%" tone="success" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Mock Data Layer</Typography>
              <StatusChip label="Operational" tone="success" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Background Jobs</Typography>
              <StatusChip label="Operational" tone="success" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Recent Activity
            </Typography>
            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No session activity yet. Actions like sending a message or approving a finding will
                appear here in real time.
              </Typography>
            ) : (
              events.slice(0, 6).map((e) => (
                <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {e.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {e.detail}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
