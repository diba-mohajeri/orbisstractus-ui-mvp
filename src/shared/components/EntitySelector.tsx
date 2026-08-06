import { Box, Typography } from '@mui/material';
import StatusChip, { type StatusTone } from './StatusChip';
import { legacyTokens } from '../../theme/theme';

export interface EntitySelectorOption {
  id: string;
  title: string;
  meta: { label: string; tone?: StatusTone }[];
}

interface EntitySelectorProps {
  options: EntitySelectorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function EntitySelector({ options, selectedId, onSelect }: EntitySelectorProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${Math.min(options.length, 4)}, 1fr)` },
        gap: 1.5,
        mb: 3,
      }}
    >
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <Box
            key={option.id}
            component="button"
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
            sx={{
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              outline: isSelected ? `3px solid ${legacyTokens.blueSoft}` : 'none',
              borderRadius: 3,
              p: 2,
              bgcolor: isSelected ? legacyTokens.blueSoft : '#fff',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Typography sx={{ fontWeight: 800, mb: 1 }}>{option.title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {option.meta.map((m) => (
                <StatusChip key={m.label} label={m.label} tone={m.tone ?? 'neutral'} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
