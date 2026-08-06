import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StatusChip from '../../../shared/components/StatusChip';
import { useAssetRecords, useBuildingSystems, useDeficienciesForBuilding } from '../../client-portal/api';
import type { ProjectRow } from '../../../api/contracts/operations';

interface QaCheckOverlayProps {
  open: boolean;
  onClose: () => void;
  project?: ProjectRow;
}

export default function QaCheckOverlay({ open, onClose, project }: QaCheckOverlayProps) {
  const buildingId = project?.buildingId ?? null;
  const { data: systems } = useBuildingSystems(open ? buildingId : null);
  const assetQuery = useAssetRecords({ buildingId: buildingId ?? undefined, page: 0, pageSize: 500 });
  const { data: deficiencies } = useDeficienciesForBuilding(open ? buildingId : null);

  const checks = [
    { label: 'Systems tracked', pass: (systems?.length ?? 0) > 0, detail: `${systems?.length ?? 0} systems` },
    {
      label: 'Asset records captured',
      pass: (assetQuery.data?.totalCount ?? 0) > 0,
      detail: `${assetQuery.data?.totalCount ?? 0} records`,
    },
    { label: 'Deficiencies documented', pass: true, detail: `${deficiencies?.length ?? 0} findings` },
    { label: 'Consultant lead assigned', pass: Boolean(project?.consultantLead), detail: project?.consultantLead ?? 'Unassigned' },
  ];

  const allPass = checks.every((c) => c.pass);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        QA Completeness Check
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {project && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.buildingName} — {project.serviceLine} Assessment
          </Typography>
        )}
        <Stack spacing={1}>
          {checks.map((c) => (
            <Box
              key={c.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.25,
              }}
            >
              <Box>
                <Typography variant="body2">{c.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.detail}
                </Typography>
              </Box>
              <StatusChip label={c.pass ? 'Pass' : 'Needs Attention'} tone={c.pass ? 'success' : 'error'} />
            </Box>
          ))}
        </Stack>
        <Box sx={{ mt: 2 }}>
          <StatusChip label={allPass ? 'Ready for QA Sign-Off' : 'Incomplete'} tone={allPass ? 'success' : 'warning'} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
