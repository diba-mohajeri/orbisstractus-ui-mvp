import { Box, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { legacyTokens } from '../../theme/theme';

interface LineageFlowProps {
  steps: string[];
}

export default function LineageFlow({ steps }: LineageFlowProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.5 }}>
      {steps.map((step, index) => (
        <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              px: 2,
              py: 1,
              bgcolor: '#fbfcfe',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 800, color: legacyTokens.navy, fontSize: 14 }}>{step}</Typography>
          </Box>
          {index < steps.length - 1 && (
            <ArrowDownwardIcon fontSize="small" sx={{ color: 'text.secondary', my: 0.25 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}
