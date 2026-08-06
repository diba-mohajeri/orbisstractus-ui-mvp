import { Alert, Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import StatusChip from '../../../shared/components/StatusChip';
import { legacyTokens } from '../../../theme/theme';

interface GenerateReportDraftDialogProps {
  open: boolean;
  onClose: () => void;
}

const OUTPUTS = [
  ['Findings Table', '3 approved deficiencies (DEF-ROOF-023, DEF-WIN-011, DEF-PARK-004)', 'Generated'],
  ['Capital Schedule', 'Analyst cost logic · CIQS/RSMeans defaults · 10-year horizon', 'Generated'],
  ['Narrative Sections', 'Analyst narrative text · PEO template populated', 'Populated'],
  ['Drawing References', 'Markup drawings from Inspector (OBS-WIN-011 callouts)', 'Linked'],
] as const;

export default function GenerateReportDraftDialog({ open, onClose }: GenerateReportDraftDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 820 } }, backdrop: { sx: { bgcolor: 'rgba(44,54,67,.5)', backdropFilter: 'grayscale(70%)' } } }}
    >
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography component="h2" sx={{ color: legacyTokens.navy, fontSize: 25, fontWeight: 900, mb: 0.5 }}>Generate Report Draft</Typography>
        <Typography variant="body2" color="text.secondary">Building findings tables and capital schedule from approved analyst records</Typography>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ mt: 1.5, borderColor: 'divider' }}>Close</Button>
      </Box>
      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
        <Alert severity="success" sx={{ mb: 2.5 }}>3 approved analyst findings found — ready to generate.</Alert>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 120px' }, gap: 2, bgcolor: '#f3f5f8', px: 2, py: 1.3 }}>
            {['Output', 'Source', 'Status'].map((heading) => <Typography key={heading} variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>{heading}</Typography>)}
          </Box>
          {OUTPUTS.map(([output, source, status]) => (
            <Box key={output} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 120px' }, gap: { xs: 0.5, sm: 2 }, alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{output}</Typography>
              <Typography variant="body2" color="text.secondary">{source}</Typography>
              <Stack direction="row" sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}><StatusChip label={status} tone="success" /></Stack>
            </Box>
          ))}
        </Box>
        <Alert severity="warning" icon={false} sx={{ mt: 2.5, bgcolor: legacyTokens.amberSoft, color: '#805415', borderLeft: `4px solid ${legacyTokens.amber}` }}>
          Word report and Excel appendix are now ready for QA review. Apply P.Eng. seal after QA is complete.
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
