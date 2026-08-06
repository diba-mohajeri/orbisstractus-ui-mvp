import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../shared/components/DataTable';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import RowActionButton from '../../../shared/components/RowActionButton';
import RuleStatusList from '../../../shared/components/RuleStatusList';
import { useToast } from '../../../shared/store/toastStore';
import { useAuditLogStore } from '../../../shared/store/auditLogStore';
import type { MessageRow } from '../../../api/contracts/messages';
import type { MessageStatus } from '../../../domain/messages';
import { useBuildingSummaries, useProjects } from '../api';
import { useCreateMessage, useMessages } from './api';

const STATUS_TONE: Record<MessageStatus, StatusTone> = {
  open: 'warning',
  scheduled: 'neutral',
  approved: 'success',
  inReview: 'warning',
};

const STATUS_LABEL: Record<MessageStatus, string> = {
  open: 'Open',
  scheduled: 'Scheduled',
  approved: 'Approved',
  inReview: 'In Review',
};

const GOVERNANCE_RULES = [
  { rule: 'Draft reports hidden from client view', status: 'Enforced' },
  { rule: 'Internal QA discussion hidden from client view', status: 'Enforced' },
  { rule: 'Final reports visible only after release', status: 'Enforced' },
  { rule: 'Downloads are logged for audit purposes', status: 'Enforced' },
  { rule: 'Approvals are recorded with timestamp and user', status: 'Enforced' },
  { rule: 'Access is scoped by role (owner, board, PM, auditor)', status: 'Enforced' },
];

export default function CommunicationCenterPage() {
  const toast = useToast();
  const logEvent = useAuditLogStore((s) => s.logEvent);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [projectId, setProjectId] = useState('');

  const { data: messages, isLoading } = useMessages();
  const { data: buildings } = useBuildingSummaries();
  const { data: projects } = useProjects();
  const createMessage = useCreateMessage();

  const projectOptions = useMemo(
    () => (projects ?? []).filter((p) => p.buildingId === buildingId),
    [projects, buildingId],
  );

  function resetForm() {
    setSubject('');
    setBuildingId('');
    setProjectId('');
  }

  function handleSend() {
    if (!subject.trim() || !buildingId) return;
    createMessage.mutate(
      { subject: subject.trim(), buildingId, projectId: projectId || null },
      {
        onSuccess: () => {
          toast('Question sent to the Client Success team.');
          logEvent('Message sent', subject.trim());
          setComposeOpen(false);
          resetForm();
        },
      },
    );
  }

  const columns: GridColDef<MessageRow>[] = [
    { field: 'subject', headerName: 'Message / Request', flex: 1.4, minWidth: 220 },
    {
      field: 'projectId',
      headerName: 'Related Project',
      width: 130,
      valueFormatter: (value) => (value ? value : '—'),
    },
    { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip label={STATUS_LABEL[params.value as MessageStatus]} tone={STATUS_TONE[params.value as MessageStatus]} />
      ),
    },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 130 },
    {
      field: 'action',
      headerName: '',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <RowActionButton
          label={params.row.status === 'open' ? 'Respond' : 'View'}
          onClick={() => toast(`Opening "${params.row.subject}"…`)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Communication Tracker</Typography>
            <Button variant="contained" onClick={() => setComposeOpen(true)}>
              Ask Question
            </Button>
          </Box>
          <DataTable columns={columns} rows={messages ?? []} loading={isLoading} height={380} />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Client Portal Governance
          </Typography>
          <RuleStatusList items={GOVERNANCE_RULES} />
        </CardContent>
      </Card>

      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ask a Question</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Building"
              value={buildingId}
              onChange={(e) => {
                setBuildingId(e.target.value);
                setProjectId('');
              }}
              fullWidth
            >
              {(buildings ?? []).map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Related Project (optional)"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              fullWidth
              disabled={!buildingId || projectOptions.length === 0}
            >
              <MenuItem value="">None</MenuItem>
              {projectOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.serviceLine} Assessment
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Your question"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!subject.trim() || !buildingId || createMessage.isPending}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
