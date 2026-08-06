import { Box, Typography } from '@mui/material';
import { legacyTokens } from '../../theme/theme';

export type KpiTone = 'success' | 'warning' | 'error' | 'neutral';

export interface KpiTileData {
  label: string;
  value: string;
  tone?: KpiTone;
}

interface KpiStripProps {
  items: KpiTileData[];
  onSelect?: (item: KpiTileData) => void;
}

const TONE_COLOR: Record<KpiTone, string> = {
  success: legacyTokens.green,
  warning: legacyTokens.amber,
  error: legacyTokens.red,
  neutral: legacyTokens.navy,
};

export default function KpiStrip({ items, onSelect }: KpiStripProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(4, 1fr)',
          md: `repeat(${items.length}, 1fr)`,
        },
        gap: 1.5,
        mb: 3,
      }}
    >
      {items.map((item) => {
        const color = TONE_COLOR[item.tone ?? 'neutral'];
        return (
          <Box
            key={item.label}
            component={onSelect ? 'button' : 'div'}
            type={onSelect ? 'button' : undefined}
            onClick={onSelect ? () => onSelect(item) : undefined}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 1.75,
              textAlign: 'left',
              bgcolor: '#fbfcfe',
              display: 'block',
              width: '100%',
              font: 'inherit',
              cursor: onSelect ? 'pointer' : 'default',
              '&:hover': onSelect ? { borderColor: 'primary.main' } : undefined,
              '&:focus-visible': onSelect
                ? { outline: `3px solid ${legacyTokens.blue}`, outlineOffset: 2 }
                : undefined,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, color }}>
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
