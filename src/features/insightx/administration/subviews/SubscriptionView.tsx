import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import StatusChip from '../../../../shared/components/StatusChip';
import RowActionButton from '../../../../shared/components/RowActionButton';
import { useToast } from '../../../../shared/store/toastStore';
import { usePortfolioSummary } from '../../../client-portal/api';
import { sectionTitleSx } from '../../shared/pageStyles';

export default function SubscriptionView() {
  const toast = useToast();
  const { data: summary } = usePortfolioSummary();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
            Current Plan
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Tier</Typography>
              <StatusChip label="Enterprise" tone="success" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Buildings Under Management</Typography>
              <Typography variant="body2">{summary?.buildings ?? '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Renewal</Typography>
              <Typography variant="body2">Annual</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
            Billing Actions
          </Typography>
          <Stack spacing={1}>
            <RowActionButton label="View Invoices" onClick={() => toast('Invoice history opened.')} />
            <RowActionButton label="Update Payment Method" onClick={() => toast('Payment method updated.')} />
            <RowActionButton label="Request Seat Increase" onClick={() => toast('Seat increase request sent.')} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
