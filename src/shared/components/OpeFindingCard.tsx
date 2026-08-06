import { Box, Stack, Typography } from '@mui/material';
import StatusChip, { severityTone } from './StatusChip';
import type { DeficiencySeverity } from '../../domain/portfolioAssets';

interface OpeFindingCardProps {
  title: string;
  severity: DeficiencySeverity;
  problem: string;
  effect: string;
  recommendation: string;
  cost: string;
  sourceTrace: string;
}

export default function OpeFindingCard({ title, severity, problem, effect, recommendation, cost, sourceTrace }: OpeFindingCardProps) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
      <Box
        sx={{
          bgcolor: '#f8fafc',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
        <StatusChip label={severity} tone={severityTone(severity)} />
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Problem:</strong> {problem}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Effect:</strong> {effect}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          <strong>Recommendation:</strong> {recommendation}
        </Typography>
        <Stack direction="row" spacing={3}>
          <Typography variant="caption" color="text.secondary">
            Cost: {cost}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Source: {sourceTrace}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
