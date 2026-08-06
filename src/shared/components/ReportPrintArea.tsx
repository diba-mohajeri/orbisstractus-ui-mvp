import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface ReportPrintAreaProps {
  children: ReactNode;
}

export default function ReportPrintArea({ children }: ReportPrintAreaProps) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 2, md: 4 },
        maxWidth: 900,
        mx: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
