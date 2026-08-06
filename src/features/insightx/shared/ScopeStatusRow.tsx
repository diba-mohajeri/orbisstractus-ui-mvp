import { Box, Typography } from '@mui/material';
import StatusChip from '../../../shared/components/StatusChip';
import { SCOPE_STATUS_LABEL, type SystemScopeStatus } from '../../../shared/store/intakeGovernanceStore';
import { legacyTokens } from '../../../theme/theme';

interface ScopeStatusRowProps {
  code: string;
  name: string;
  status: SystemScopeStatus;
}

export default function ScopeStatusRow({ code, name, status }: ScopeStatusRowProps) {
  const color = status === 'inScope'
    ? { bg: legacyTokens.greenSoft, fg: legacyTokens.green }
    : status === 'limited'
      ? { bg: legacyTokens.amberSoft, fg: legacyTokens.amber }
      : status === 'optionalReview'
        ? { bg: legacyTokens.blueSoft, fg: legacyTokens.blue }
        : { bg: '#eef1f4', fg: '#667085' };
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, bgcolor: '#fffaf0', border: '1px solid #eadfc9', borderRadius: 2, px: 2, py: 1.35 }}>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>{code} · {name}</Typography>
        <Typography variant="caption" color="text.secondary">PM scope status: {SCOPE_STATUS_LABEL[status]}</Typography>
      </Box>
      <StatusChip label={SCOPE_STATUS_LABEL[status]} tone="neutral" bg={color.bg} fg={color.fg} />
    </Box>
  );
}
