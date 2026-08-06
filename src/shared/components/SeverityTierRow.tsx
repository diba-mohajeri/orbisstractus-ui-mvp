import { Box, Card, CardContent, Typography } from '@mui/material';
import type { StatusTone } from './StatusChip';
import { legacyTokens } from '../../theme/theme';

export interface SeverityTierItem {
  key: string;
  label: string;
  count: number;
  description: string;
  tone: StatusTone;
}

const TONE_COLOR: Record<StatusTone, string> = {
  success: legacyTokens.green,
  warning: legacyTokens.amber,
  error: legacyTokens.red,
  neutral: legacyTokens.muted,
};

interface SeverityTierRowProps {
  items: SeverityTierItem[];
  unit: string;
  onSelect?: (item: SeverityTierItem) => void;
}

export default function SeverityTierRow({ items, unit, onSelect }: SeverityTierRowProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${items.length}, 1fr)` },
            gap: 1.5,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.key}
              component={onSelect ? 'button' : 'div'}
              type={onSelect ? 'button' : undefined}
              onClick={onSelect ? () => onSelect(item) : undefined}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 2,
                textAlign: 'left',
                bgcolor: '#fbfcfe',
                font: 'inherit',
                cursor: onSelect ? 'pointer' : 'default',
                '&:hover': onSelect ? { borderColor: 'primary.main' } : undefined,
              }}
            >
              <Typography sx={{ fontWeight: 900, color: TONE_COLOR[item.tone] }}>{item.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, my: 0.5 }}>
                {item.count} {unit}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
