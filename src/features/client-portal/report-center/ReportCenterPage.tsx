import { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../shared/components/DataTable';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import RowActionButton from '../../../shared/components/RowActionButton';
import { useToast } from '../../../shared/store/toastStore';
import type { ReportRow } from '../../../api/contracts/operations';
import type { ReportStatus } from '../../../domain/reports';
import { useReports } from './api';

const STATUS_TONE: Record<ReportStatus, StatusTone> = {
  released: 'success',
  clientApproved: 'success',
  superseded: 'neutral',
  draftHidden: 'error',
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  released: 'Released',
  clientApproved: 'Client Approved',
  superseded: 'Superseded',
  draftHidden: 'Draft Hidden',
};

export default function ReportCenterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildingFilter = searchParams.get('building') ?? undefined;
  const toast = useToast();
  const { data: reports, isLoading } = useReports();

  const rows = useMemo(
    () => (buildingFilter ? (reports ?? []).filter((r) => r.buildingId === buildingFilter) : reports ?? []),
    [reports, buildingFilter],
  );

  const columns: GridColDef<ReportRow>[] = [
    {
      field: 'name',
      headerName: 'Report Name',
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_value, row) => `${row.serviceLine} Report`,
    },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'version', headerName: 'Version', width: 90 },
    { field: 'releaseDate', headerName: 'Release Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <StatusChip label={STATUS_LABEL[params.value as ReportStatus]} tone={STATUS_TONE[params.value as ReportStatus]} />
      ),
    },
    {
      field: 'availableFormats',
      headerName: 'Available Formats',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5, py: 1 }}>
          {(params.value as string[]).map((f) => (
            <Chip key={f} label={f} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const hasPortalView = params.row.availableFormats.includes('Portal View');
        return (
          <RowActionButton
            label={hasPortalView ? 'View in Portal' : 'Download PDF'}
            onClick={() =>
              hasPortalView
                ? navigate(`/report-viewer/${params.row.id}?mode=preview&from=client`)
                : toast(`Download started for ${params.row.id}.`)
            }
          />
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Typography variant="h6">Report Center</Typography>
          <Chip label="Released Deliverables Only" size="small" color="success" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Access released BCA, Envelope, Energy, Reserve Fund, and Execution deliverables. Draft
          reports are not shown here — they remain internal until released.
          {buildingFilter && ' Filtered by building from Project Center.'}
        </Typography>
        <Box>
          <DataTable columns={columns} rows={rows} loading={isLoading} height={480} />
        </Box>
      </CardContent>
    </Card>
  );
}
