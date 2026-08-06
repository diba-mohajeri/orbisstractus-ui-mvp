import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import StatusChip from '../../../../shared/components/StatusChip';
import RowActionButton from '../../../../shared/components/RowActionButton';
import { useToast } from '../../../../shared/store/toastStore';
import { sectionTitleSx } from '../../shared/pageStyles';

const TEMPLATE_SECTIONS = [
  { name: 'Cover & Executive Summary', gated: false },
  { name: 'Scope & Methodology', gated: false },
  { name: 'Findings by System (OPE Format)', gated: true },
  { name: 'Capital Planning Summary', gated: true },
  { name: 'Photo Appendix & Traceability', gated: false },
];

export default function ReportConfigView() {
  const toast = useToast();

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1 }}>
          Report Configuration Engine
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Controls which report template sections require a P.Eng gate before release.
        </Typography>
        <Stack spacing={1}>
          {TEMPLATE_SECTIONS.map((s) => (
            <Box
              key={s.name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.25,
              }}
            >
              <Typography variant="body2">{s.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StatusChip label={s.gated ? 'P.Eng Gate' : 'No Gate'} tone={s.gated ? 'warning' : 'neutral'} />
                <RowActionButton label="Configure" onClick={() => toast(`${s.name} configuration saved.`)} />
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
