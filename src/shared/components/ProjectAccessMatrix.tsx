import { Fragment } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import StatusChip from './StatusChip';
import type { AccessLevel, ProjectStepKey } from '../../domain/projectAccess';
import type { ProjectAccessRow } from '../../api/contracts/projectAccess';

const DEFAULT_LABEL: Record<AccessLevel, string> = {
  none: 'None',
  view: 'View',
  edit: 'Edit',
};

interface ProjectAccessMatrixProps {
  rows: ProjectAccessRow[];
  steps: ProjectStepKey[];
  stepLabel: (step: ProjectStepKey) => string;
  onSetAccess: (employeeId: string, step: ProjectStepKey, level: AccessLevel | null) => void;
  disabled?: boolean;
}

export default function ProjectAccessMatrix({ rows, steps, stepLabel, onSetAccess, disabled }: ProjectAccessMatrixProps) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `170px repeat(${steps.length}, minmax(150px, 1fr))`,
          minWidth: 560,
          rowGap: 0.5,
          columnGap: 1,
          alignItems: 'center',
        }}
      >
        <Box />
        {steps.map((step) => (
          <Typography key={step} variant="caption" sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
            {stepLabel(step)}
          </Typography>
        ))}
        {rows.map((row) => (
          <Fragment key={row.employeeId}>
            <Box sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.employeeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.onTeam ? 'On team' : 'Not on team'}
              </Typography>
            </Box>
            {steps.map((step) => {
              const cell = row.access[step];
              return (
                <Box key={`${row.employeeId}-${step}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, py: 0.5 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    disabled={disabled}
                    value={cell.isOverride ? cell.level : '__default__'}
                    onChange={(event) => {
                      const next = event.target.value;
                      onSetAccess(row.employeeId, step, next === '__default__' ? null : (next as AccessLevel));
                    }}
                    slotProps={{ select: { 'aria-label': `${row.employeeName} — ${stepLabel(step)}` } }}
                  >
                    <MenuItem value="__default__">
                      {cell.isOverride ? 'Default' : `Default — ${DEFAULT_LABEL[cell.level]}`}
                    </MenuItem>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="view">View</MenuItem>
                    <MenuItem value="edit">Edit</MenuItem>
                  </TextField>
                  {cell.isOverride && <StatusChip label={`Override — ${DEFAULT_LABEL[cell.level]}`} tone="neutral" />}
                </Box>
              );
            })}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
