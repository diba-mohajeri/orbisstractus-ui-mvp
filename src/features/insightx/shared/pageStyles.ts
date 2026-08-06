import type { SxProps, Theme } from '@mui/material';
import { legacyTokens } from '../../../theme/theme';

// Shared visual language for the InsightX employee workspace pages, matching the
// Report + QA and Delivery pages: bold navy headings sized up from MUI defaults,
// uppercase letter-spaced micro-labels for subsection dividers, bordered row cards,
// and navy/soft-blue filled buttons in place of plain outlined ones.

export const pageTitleSx: SxProps<Theme> = {
  color: legacyTokens.navy,
  fontSize: { xs: 26, lg: 32 },
  fontWeight: 900,
  mb: 0.6,
};

export const sectionTitleSx: SxProps<Theme> = {
  color: legacyTokens.navy,
  fontSize: 19,
  fontWeight: 900,
};

export const subsectionTitleSx: SxProps<Theme> = {
  fontSize: 15,
  fontWeight: 900,
};

export const sectionLabelSx: SxProps<Theme> = {
  color: 'text.secondary',
  display: 'block',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '.11em',
  mb: 1,
  textTransform: 'uppercase',
};

export const rowCardSx: SxProps<Theme> = {
  alignItems: 'flex-start',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  display: 'flex',
  gap: 1,
  justifyContent: 'space-between',
  p: 1.25,
};

export const navyButtonSx: SxProps<Theme> = {
  bgcolor: legacyTokens.navy,
  '&:hover': { bgcolor: '#102d50' },
};

export const softBlueButtonSx: SxProps<Theme> = {
  bgcolor: legacyTokens.blueSoft,
  color: legacyTokens.blue,
  '&:hover': { bgcolor: '#dde8fa' },
};

export const heroCardContentSx: SxProps<Theme> = {
  p: { xs: 2, lg: 3 },
  '&:last-child': { pb: { xs: 2, lg: 3 } },
};
