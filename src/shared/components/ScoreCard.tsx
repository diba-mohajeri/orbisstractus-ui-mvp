import { Box, LinearProgress, Typography } from '@mui/material';
import type { StatusTone } from './StatusChip';
import { legacyTokens } from '../../theme/theme';

export function scoreTone(score: number): StatusTone {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

const TONE_COLOR: Record<StatusTone, string> = {
  success: legacyTokens.green,
  warning: legacyTokens.amber,
  error: legacyTokens.red,
  neutral: legacyTokens.navy,
};

export interface ScoreCardMeta {
  label: string;
  value: string;
}

interface ScoreCardProps {
  title: string;
  score: number;
  meta?: ScoreCardMeta[];
  tone?: StatusTone;
  onClick?: () => void;
}

export default function ScoreCard({ title, score, meta = [], tone, onClick }: ScoreCardProps) {
  const resolvedTone = tone ?? scoreTone(score);
  const color = TONE_COLOR[resolvedTone];

  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        textAlign: 'left',
        font: 'inherit',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 2,
        bgcolor: '#fff',
        width: '100%',
        '&:hover': onClick ? { borderColor: 'primary.main' } : undefined,
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 1 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color }}>
          {score}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / 100
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 999,
          mb: 1.25,
          bgcolor: '#e8eef6',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
      {meta.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          {meta.map((m) => (
            <Box key={m.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {m.label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {m.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
