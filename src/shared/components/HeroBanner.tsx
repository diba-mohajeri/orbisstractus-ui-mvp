import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { legacyTokens } from '../../theme/theme';

interface HeroMetric {
  label: string;
  value: string;
}

interface HeroBannerProps {
  title: string;
  description: string;
  badges?: string[];
  metrics?: HeroMetric[];
}

export default function HeroBanner({ title, description, badges = [], metrics = [] }: HeroBannerProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: '#fff', overflow: 'hidden', position: 'relative', '&::before': { content: '""', position: 'absolute', inset: '0 auto 0 0', width: 5, background: 'linear-gradient(180deg, #29a8a3, #2576b9)' } }}>
      <CardContent
        sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box sx={{ flex: '1 1 420px' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.5, mb: badges.length ? 2 : 0 }}>
            {description}
          </Typography>
          {badges.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {badges.map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, fontWeight: 800 }}
                />
              ))}
            </Stack>
          )}
        </Box>
        {metrics.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(110px, 1fr))', sm: `repeat(${Math.min(metrics.length, 4)}, minmax(110px, 1fr))` }, gap: 1.25, flex: '1 1 440px', maxWidth: 650 }}>
            {metrics.map((metric) => (
              <Box
                key={metric.label}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.5,
                  textAlign: 'left',
                  bgcolor: '#fff',
                  minWidth: 0,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, color: legacyTokens.navy }}>
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
