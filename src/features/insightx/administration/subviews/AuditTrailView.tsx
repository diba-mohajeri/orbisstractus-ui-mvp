import { useMemo, useState } from 'react';
import { Box, Card, CardContent, TextField, Typography } from '@mui/material';
import DataTable from '../../../../shared/components/DataTable';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useAuditLogStore } from '../../../../shared/store/auditLogStore';
import { sectionTitleSx } from '../../shared/pageStyles';

export default function AuditTrailView() {
  const events = useAuditLogStore((s) => s.events);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => (search ? events.filter((e) => `${e.action} ${e.detail}`.toLowerCase().includes(search.toLowerCase())) : events),
    [events, search],
  );

  const kpis: KpiTileData[] = [
    { label: 'Total Events', value: String(events.length), tone: 'neutral' },
    { label: 'Messages Sent', value: String(events.filter((e) => e.action === 'Message sent').length), tone: 'neutral' },
    { label: 'Findings Approved', value: String(events.filter((e) => e.action === 'Finding approved').length), tone: 'success' },
    { label: 'Seals Applied', value: String(events.filter((e) => e.action === 'P.Eng seal applied').length), tone: 'success' },
  ];

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        Audit Trail
      </Typography>
      <KpiStrip items={kpis} />

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search audit events…"
            slotProps={{ htmlInput: { 'aria-label': 'Search audit events' } }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, minWidth: 260 }}
          />
          {events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events logged yet this session. Send a message, approve a finding, or apply a
              P.Eng seal elsewhere in the app to populate this log in real time.
            </Typography>
          ) : (
            <DataTable
              columns={[
                { field: 'timestamp', headerName: 'Time', width: 160, valueFormatter: (value) => new Date(value as string).toLocaleTimeString() },
                { field: 'actor', headerName: 'Actor', width: 150 },
                { field: 'action', headerName: 'Action', width: 180 },
                { field: 'detail', headerName: 'Detail', flex: 1, minWidth: 220 },
              ]}
              rows={filtered}
              height={360}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
