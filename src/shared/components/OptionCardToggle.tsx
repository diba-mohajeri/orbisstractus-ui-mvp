import { Box, Typography } from '@mui/material';

export interface OptionCardToggleOption {
  id: string;
  title: string;
  description: string;
}

interface OptionCardToggleProps {
  options: OptionCardToggleOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function OptionCardToggle({ options, selectedId, onSelect }: OptionCardToggleProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${options.length}, 1fr)` }, gap: 1.5 }}>
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
              borderRadius: 3,
              p: 2,
              bgcolor: isSelected ? '#edf5ff' : '#fff',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{option.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
