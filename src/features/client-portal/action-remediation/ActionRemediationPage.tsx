import { useMemo } from 'react';
import { Alert, Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import KpiStrip, { type KpiTileData } from '../../../shared/components/KpiStrip';
import DataTable from '../../../shared/components/DataTable';
import LineageFlow from '../../../shared/components/LineageFlow';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import type { ActionRow } from '../../../api/contracts/operations';
import type { ActionPriority, ActionStatus } from '../../../domain/actions';
import { useActions, useActionStats } from './api';

const PRIORITY_TONE: Record<ActionPriority, StatusTone> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const STATUS_TONE: Record<ActionStatus, StatusTone> = {
  open: 'neutral',
  inProgress: 'warning',
  completed: 'success',
  overdue: 'error',
};

const STATUS_LABEL: Record<ActionStatus, string> = {
  open: 'Open',
  inProgress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

export default function ActionRemediationPage() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight') ?? undefined;

  const { data: stats } = useActionStats();
  const { data: actions, isLoading } = useActions();

  const highlighted = useMemo(
    () => (highlightId ? actions?.find((a) => a.id === highlightId) : undefined),
    [actions, highlightId],
  );

  const rows = useMemo(() => {
    if (!highlightId || !actions) return actions ?? [];
    const rest = actions.filter((a) => a.id !== highlightId);
    const match = actions.find((a) => a.id === highlightId);
    return match ? [match, ...rest] : actions;
  }, [actions, highlightId]);

  const kpis: KpiTileData[] = stats
    ? [
        { label: 'Open Actions', value: String(stats.open), tone: 'neutral' },
        { label: 'Overdue Actions', value: String(stats.overdue), tone: 'error' },
        { label: 'Critical Priority', value: String(stats.critical), tone: 'error' },
        { label: 'Completed Actions', value: String(stats.completed), tone: 'success' },
        { label: 'Budget Assigned', value: stats.budgetAssignedFormatted, tone: 'neutral' },
        { label: 'Budget Remaining', value: stats.budgetRemainingFormatted, tone: 'warning' },
        { label: 'Avg. Completion', value: `${stats.avgCompletionPct}%`, tone: 'success' },
        { label: 'PEO Review Needed', value: String(stats.peoReviewNeeded), tone: 'warning' },
      ]
    : [];

  const columns: GridColDef<ActionRow>[] = [
    { field: 'actionName', headerName: 'Action', flex: 1.3, minWidth: 200 },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 140 },
    { field: 'deficiencyId', headerName: 'Related Finding', width: 130 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => <StatusChip label={params.value} tone={PRIORITY_TONE[params.value as ActionPriority]} />,
    },
    { field: 'owner', headerName: 'Owner', width: 130 },
    { field: 'dueDate', headerName: 'Due Date', width: 110 },
    { field: 'budgetFormatted', headerName: 'Budget', width: 100 },
    {
      field: 'completionPct',
      headerName: 'Completion',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ width: '100%', py: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={params.value as number}
            sx={{ height: 6, borderRadius: 999 }}
          />
          <Typography variant="caption" color="text.secondary">
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip label={STATUS_LABEL[params.value as ActionStatus]} tone={STATUS_TONE[params.value as ActionStatus]} />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        Action &amp; Remediation Center
      </Typography>

      {highlighted && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing action linked from Deficiency Center: <strong>{highlighted.actionName}</strong> at{' '}
          {highlighted.buildingName}.
        </Alert>
      )}

      <KpiStrip items={kpis} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Action Tracker
            </Typography>
            <DataTable columns={columns} rows={rows} loading={isLoading} height={520} />
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Remediation Workflow
            </Typography>
            <LineageFlow
              steps={[
                'Finding',
                'Recommendation',
                'Budget Approval',
                'Assignment',
                'Execution',
                'Verification / Closure',
              ]}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
