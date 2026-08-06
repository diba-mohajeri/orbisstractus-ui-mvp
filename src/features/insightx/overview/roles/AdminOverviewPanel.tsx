import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { navyButtonSx, sectionTitleSx } from '../../shared/pageStyles';
import { useEmployees } from '../../administration/subviews/employees/api';

export default function AdminOverviewPanel() {
  const navigate = useNavigate();
  const { data: employees } = useEmployees();

  const kpis: KpiTileData[] = [
    { label: 'Total Employees', value: String(employees?.length ?? 0), tone: 'neutral' },
    { label: 'Active', value: String(employees?.filter((e) => e.status === 'active').length ?? 0), tone: 'success' },
    { label: 'Pending Invites', value: String(employees?.filter((e) => e.status === 'invited').length ?? 0), tone: 'warning' },
    { label: 'Administrators', value: String(employees?.filter((e) => e.role === 'admin').length ?? 0), tone: 'neutral' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
          Platform Administration
        </Typography>
        <KpiStrip items={kpis} />
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: '#fbfcfe', mb: 1.5 }}>
          <Typography variant="body2">
            Assign roles, edit employee profiles, and monitor employee activity and workload from the
            Administration console.
          </Typography>
        </Box>
        <Button variant="contained" fullWidth sx={navyButtonSx} onClick={() => navigate('/insightx/admin')}>
          Open Administration
        </Button>
      </CardContent>
    </Card>
  );
}