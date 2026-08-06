import StatusChip, { type StatusTone } from './StatusChip';
import type { AccessLevel } from '../../domain/documents';

const ACCESS_LABEL: Record<AccessLevel, string> = {
  released: 'Released',
  internalUntilRelease: 'Internal Until Release',
  visible: 'Visible',
  requiresApproval: 'Requires Approval',
};

const ACCESS_TONE: Record<AccessLevel, StatusTone> = {
  released: 'success',
  internalUntilRelease: 'error',
  visible: 'success',
  requiresApproval: 'warning',
};

interface AccessLevelBadgeProps {
  level: AccessLevel;
}

export default function AccessLevelBadge({ level }: AccessLevelBadgeProps) {
  return <StatusChip label={ACCESS_LABEL[level]} tone={ACCESS_TONE[level]} />;
}
