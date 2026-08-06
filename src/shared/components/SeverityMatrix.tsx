import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import StatusChip, { type StatusTone } from './StatusChip';

const TIER_TONE: Record<string, StatusTone> = {
  healthy: 'success',
  monitor: 'neutral',
  atRisk: 'warning',
  critical: 'error',
};

export interface SeverityMatrixRow {
  regionName: string;
  counts: { tier: string; label: string; count: number }[];
}

interface SeverityMatrixProps {
  rows: SeverityMatrixRow[];
}

export default function SeverityMatrix({ rows }: SeverityMatrixProps) {
  const tierLabels = rows[0]?.counts.map((c) => c.label) ?? [];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `160px repeat(${tierLabels.length}, 1fr)`,
          minWidth: 480,
          rowGap: 0.5,
        }}
      >
        <Box />
        {tierLabels.map((label) => (
          <Typography key={label} variant="caption" sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
            {label}
          </Typography>
        ))}
        {rows.map((row) => (
          <Fragment key={row.regionName}>
            <Typography variant="body2" sx={{ fontWeight: 700, py: 1 }}>
              {row.regionName}
            </Typography>
            {row.counts.map((c) => (
              <Box key={`${row.regionName}-${c.tier}`} sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <StatusChip label={String(c.count)} tone={TIER_TONE[c.tier] ?? 'neutral'} />
              </Box>
            ))}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
