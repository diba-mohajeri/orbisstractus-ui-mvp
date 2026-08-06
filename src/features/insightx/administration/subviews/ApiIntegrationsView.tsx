import { useState } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import StatusChip from '../../../../shared/components/StatusChip';
import RowActionButton from '../../../../shared/components/RowActionButton';
import { useToast } from '../../../../shared/store/toastStore';
import { sectionTitleSx } from '../../shared/pageStyles';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
}

const INITIAL: Integration[] = [
  { id: 'sso', name: 'Institutional SSO', connected: true },
  { id: 'accounting', name: 'Accounting / ERP Export', connected: true },
  { id: 'gis', name: 'GIS / Mapping Provider', connected: false },
  { id: 'weather', name: 'Weather Data Feed', connected: false },
];

export default function ApiIntegrationsView() {
  const toast = useToast();
  const [integrations, setIntegrations] = useState(INITIAL);

  function toggle(id: string) {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)));
    toast('Integration status updated.');
  }

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 2 }}>
          API &amp; Integrations
        </Typography>
        <Stack spacing={1}>
          {integrations.map((i) => (
            <Box
              key={i.id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}
            >
              <Typography variant="body2">{i.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StatusChip label={i.connected ? 'Connected' : 'Not Connected'} tone={i.connected ? 'success' : 'neutral'} />
                <RowActionButton label={i.connected ? 'Disconnect' : 'Connect'} onClick={() => toggle(i.id)} />
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
