import { Box, Card, CardContent, Typography } from '@mui/material';
import DataTable from '../../../../shared/components/DataTable';
import StatusChip from '../../../../shared/components/StatusChip';
import { useRegionSummaries } from '../../../client-portal/api';
import { sectionTitleSx } from '../../shared/pageStyles';

export default function OrganizationsView() {
  const { data: regions } = useRegionSummaries();

  const rows = (regions ?? []).map((r) => ({
    id: r.id,
    name: `${r.name} Property Group`,
    tier: r.buildingCount > 8 ? 'Enterprise' : 'Standard',
    buildings: r.buildingCount,
    status: 'Active',
  }));

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 2 }}>
          Organizations
        </Typography>
        <Box>
          <DataTable
            columns={[
              { field: 'name', headerName: 'Organization', flex: 1, minWidth: 200 },
              { field: 'tier', headerName: 'Tier', width: 130 },
              { field: 'buildings', headerName: 'Buildings', width: 110, type: 'number' },
              {
                field: 'status',
                headerName: 'Status',
                width: 110,
                renderCell: (params) => <StatusChip label={params.value} tone="success" />,
              },
            ]}
            rows={rows}
            height={280}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
