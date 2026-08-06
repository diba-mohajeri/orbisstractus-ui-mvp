import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { legacyTokens } from '../../theme/theme';

export interface SectionedFormRow {
  label: string;
  content: ReactNode;
}

export interface SectionedFormSection {
  title: string;
  rows: SectionedFormRow[];
}

interface SectionedFormTableProps {
  sections: SectionedFormSection[];
}

export default function SectionedFormTable({ sections }: SectionedFormTableProps) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      {sections.map((section) => (
        <Box key={section.title}>
          <Box sx={{ bgcolor: legacyTokens.navy, color: '#fff', px: 1.5, py: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>
              {section.title}
            </Typography>
          </Box>
          {section.rows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                gap: 2,
                '&:last-of-type': { borderBottom: 0 },
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                {row.label}
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{row.content}</Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
