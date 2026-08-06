import { Fragment } from 'react';
import { Box, Checkbox, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PermissionMatrixProps {
  rows: string[];
  columns: string[];
  isGranted: (row: string, column: string) => boolean;
  rowLabel?: (row: string) => string;
  columnLabel?: (column: string) => string;
  onToggle?: (row: string, column: string) => void;
  disabledCell?: (row: string, column: string) => string | false;
}

export default function PermissionMatrix({
  rows,
  columns,
  isGranted,
  rowLabel = (row) => row,
  columnLabel = (column) => column,
  onToggle,
  disabledCell,
}: PermissionMatrixProps) {
  const interactive = Boolean(onToggle);

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `160px repeat(${columns.length}, 1fr)`,
          minWidth: 480,
          rowGap: 0.25,
        }}
      >
        <Box />
        {columns.map((c) => (
          <Typography key={c} variant="caption" sx={{ fontWeight: 800, textAlign: 'center', pb: 1, px: 0.5 }}>
            {columnLabel(c)}
          </Typography>
        ))}
        {rows.map((r) => (
          <Fragment key={r}>
            <Typography variant="body2" sx={{ fontWeight: 700, py: 0.75 }}>
              {rowLabel(r)}
            </Typography>
            {columns.map((c) => {
              const granted = isGranted(r, c);
              const disabledReason = disabledCell?.(r, c) ?? false;
              if (!interactive) {
                return (
                  <Box key={`${r}-${c}`} sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                    {granted ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <Box sx={{ width: 14, height: 2, bgcolor: 'divider', borderRadius: 1 }} />
                    )}
                  </Box>
                );
              }
              const checkbox = (
                <Checkbox
                  size="small"
                  checked={granted}
                  disabled={Boolean(disabledReason)}
                  onChange={() => onToggle?.(r, c)}
                  slotProps={{ input: { 'aria-label': `${rowLabel(r)} — ${columnLabel(c)}` } }}
                />
              );
              return (
                <Box key={`${r}-${c}`} sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                  {disabledReason ? <Tooltip title={disabledReason}>{checkbox}</Tooltip> : checkbox}
                </Box>
              );
            })}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}