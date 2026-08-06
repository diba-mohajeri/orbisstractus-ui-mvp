import { Box, Stack, Typography } from '@mui/material';
import StatusChip, { type StatusTone } from './StatusChip';

export interface RuleStatusItem {
  rule: string;
  status: string;
  tone?: StatusTone;
}

interface RuleStatusListProps {
  items: RuleStatusItem[];
}

export default function RuleStatusList({ items }: RuleStatusListProps) {
  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <Box
          key={item.rule}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.25,
          }}
        >
          <Typography variant="body2">{item.rule}</Typography>
          <StatusChip label={item.status} tone={item.tone ?? 'success'} />
        </Box>
      ))}
    </Stack>
  );
}
