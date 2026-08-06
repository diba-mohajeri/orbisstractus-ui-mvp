import type { ReactNode } from 'react';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import type { AccessLevel } from '../../../domain/projectAccess';

interface StepAccessGateProps {
  level: AccessLevel;
  stepLabel: string;
  isLoading: boolean;
  children: ReactNode;
}

export default function StepAccessGate({ level, stepLabel, isLoading, children }: StepAccessGateProps) {
  if (isLoading) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Loading access…
      </Typography>
    );
  }

  if (level === 'none') {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error">
            <strong>Access Restricted.</strong> You don&apos;t have access to {stepLabel} on this project. Ask an
            administrator to grant you access in Administration → Project Access.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {level === 'view' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>View Only.</strong> You have view access to {stepLabel} on this project. Primary actions below are
          disabled. Ask an administrator for Edit access in Administration → Project Access.
        </Alert>
      )}
      {children}
    </Box>
  );
}
