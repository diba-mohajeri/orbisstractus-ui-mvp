import { Card, CardContent, Typography } from '@mui/material';

interface ModulePlaceholderPageProps {
  title: string;
  wireframe: string;
  phase?: string;
}

export default function ModulePlaceholderPage({ title, wireframe, phase }: ModulePlaceholderPageProps) {
  return (
    <Card sx={{ maxWidth: 720 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">
          This module's real content ({wireframe}) ships in {phase ?? 'a later phase'} of plan.md.
          This placeholder confirms the shell, nav, and breadcrumb route here correctly.
        </Typography>
      </CardContent>
    </Card>
  );
}
