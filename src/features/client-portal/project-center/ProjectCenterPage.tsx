import { Box, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../shared/components/DataTable';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import RowActionButton from '../../../shared/components/RowActionButton';
import type { ProjectRow } from '../../../api/contracts/operations';
import type { ProjectStatus } from '../../../domain/projects';
import { useProjects } from '../api';

const STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  active: 'warning',
  planned: 'neutral',
  complete: 'success',
};

function actionFor(project: ProjectRow): { label: string; to: string } {
  if (project.status === 'active') return { label: 'View Project', to: `/portal/digital-twin?building=${project.buildingId}` };
  if (project.status === 'planned') return { label: 'Ask Question', to: `/portal/communications?building=${project.buildingId}` };
  return { label: 'View Deliverables', to: `/portal/reports?building=${project.buildingId}` };
}

export default function ProjectCenterPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();

  const columns: GridColDef<ProjectRow>[] = [
    {
      field: 'project',
      headerName: 'Project',
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_value, row) => `${row.serviceLine} Assessment`,
    },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'serviceLine', headerName: 'Service Line', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => <StatusChip label={params.value} tone={STATUS_TONE[params.value as ProjectStatus]} />,
    },
    { field: 'currentStage', headerName: 'Current Stage', flex: 1, minWidth: 150 },
    { field: 'consultantLead', headerName: 'Consultant Lead', width: 150 },
    { field: 'targetDeliveryDate', headerName: 'Target Delivery', width: 130 },
    {
      field: 'actions',
      headerName: 'Client Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const action = actionFor(params.row);
        return <RowActionButton label={action.label} onClick={() => navigate(action.to)} />;
      },
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Project Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track active and historical engagements from intake through delivery.
        </Typography>
        <Box>
          <DataTable columns={columns} rows={projects ?? []} loading={isLoading} height={480} />
        </Box>
      </CardContent>
    </Card>
  );
}
