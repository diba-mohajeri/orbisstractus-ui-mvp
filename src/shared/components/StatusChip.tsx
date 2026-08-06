import { Chip } from '@mui/material';
import { legacyTokens } from '../../theme/theme';

export type StatusTone = 'success' | 'warning' | 'error' | 'neutral';

const TONE_STYLES: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: legacyTokens.greenSoft, fg: legacyTokens.green },
  warning: { bg: legacyTokens.amberSoft, fg: legacyTokens.amber },
  error: { bg: legacyTokens.redSoft, fg: legacyTokens.red },
  neutral: { bg: '#f1f5f9', fg: '#475569' },
};

interface StatusChipProps {
  label: string;
  tone: StatusTone;
  bg?: string;
  fg?: string;
}

export default function StatusChip({ label, tone, bg, fg }: StatusChipProps) {
  const style = TONE_STYLES[tone];
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: bg ?? style.bg, color: fg ?? style.fg, fontWeight: 800, textTransform: 'capitalize' }}
    />
  );
}

export function riskTone(risk: 'low' | 'medium' | 'high'): StatusTone {
  if (risk === 'high') return 'error';
  if (risk === 'medium') return 'warning';
  return 'success';
}

export function conditionTone(condition: 'good' | 'fair' | 'poor' | 'critical'): StatusTone {
  if (condition === 'critical') return 'error';
  if (condition === 'poor') return 'error';
  if (condition === 'fair') return 'warning';
  return 'success';
}

export function severityTone(severity: 'critical' | 'high' | 'medium' | 'low'): StatusTone {
  if (severity === 'critical' || severity === 'high') return 'error';
  if (severity === 'medium') return 'warning';
  return 'success';
}

export function healthTone(healthTier: 'healthy' | 'monitor' | 'atRisk' | 'critical'): StatusTone {
  if (healthTier === 'critical') return 'error';
  if (healthTier === 'atRisk') return 'warning';
  if (healthTier === 'monitor') return 'neutral';
  return 'success';
}
