import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import StatusChip from '../../../../shared/components/StatusChip';
import LineageFlow from '../../../../shared/components/LineageFlow';
import PermissionMatrix from '../../../../shared/components/PermissionMatrix';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const MODULES = [
  { name: 'BCA', status: 'Built' as const },
  { name: 'EnvelopeX', status: 'Built' as const },
  { name: 'ReserveX', status: 'Partial' as const },
  { name: 'EnergyX', status: 'Roadmap' as const },
  { name: 'Forensic Engineering', status: 'Roadmap' as const },
  { name: 'Commissioning / Retro-Cx', status: 'Roadmap' as const },
];

const ROLES = ['PM / Intake', 'Inspector', 'Analyst', 'Report + QA', 'Delivery'];
const STAGES = ['Intake', 'Inspection', 'Analysis', 'Report+QA', 'Delivery'];
const ACCESS: Record<string, string[]> = {
  'PM / Intake': ['Intake'],
  Inspector: ['Inspection'],
  Analyst: ['Analysis'],
  'Report + QA': ['Report+QA'],
  Delivery: ['Delivery'],
};

export default function WorkflowConfigView() {
  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        Workflow Configuration
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
            Business Line Modules
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {MODULES.map((m) => (
              <StatusChip key={m.name} label={`${m.name} · ${m.status}`} tone={m.status === 'Built' ? 'success' : 'warning'} />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Workflow Designer — BCA Pipeline
            </Typography>
            <LineageFlow steps={STAGES} />
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Module Access Matrix
            </Typography>
            <PermissionMatrix rows={ROLES} columns={STAGES} isGranted={(row, col) => ACCESS[row]?.includes(col) ?? false} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
