import { Box, Button, Card, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { legacyTokens } from '../../../theme/theme';

const metrics = [
  { value: '12', label: 'Assets in portfolio' },
  { value: '2', label: 'Undergoing assessment' },
  { value: '1', label: 'Request in draft' },
  { value: '3', label: 'Issued reports' },
];

const actions = [
  { number: '01', title: 'Client Asset Portfolio', description: 'View properties, assessment history, risk status, capital planning outputs, and cross-asset visibility across your organization.', tags: [{ label: 'Portfolio', tone: 'blue' }, { label: 'Multi-asset', tone: 'blue' }], button: 'Open Portfolio', to: '/portal/portfolio-hub' },
  { number: '02', title: 'Undergoing Assessment', description: 'Track active assessments, milestone progress, client action items, open requests, draft deliverables, and QA status.', tags: [{ label: 'Active', tone: 'amber' }, { label: 'Status', tone: 'blue' }], button: 'View Active Work', to: '/portal/undergoing-assessments' },
  { number: '03', title: 'Request for Assessment', description: 'Launch a new assessment request. Choose a direct request or create a request connected to a public tender / RFP process.', tags: [{ label: 'New Request', tone: 'blue' }, { label: 'Tender Optional', tone: 'amber' }], button: 'Start Request', to: '/portal/request-assessment' },
] as const;

const tagSx = (tone: 'blue' | 'amber') => ({
  bgcolor: tone === 'amber' ? legacyTokens.amberSoft : legacyTokens.blueSoft,
  color: tone === 'amber' ? legacyTokens.amber : legacyTokens.blue,
  fontWeight: 800,
  border: 'none',
});

export default function ClientPortalHomePage() {
  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <Card component="section" sx={{ p: { xs: 3, md: 4.5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(420px, .85fr)' }, gap: { xs: 4, lg: 6 }, alignItems: 'center' }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 32, md: 43 }, lineHeight: 1.12, letterSpacing: '-.035em', mb: 2 }}>Welcome to Orbisstractus Partner Network</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: 1.75, maxWidth: 740, mb: 3 }}>
            Select how you want to engage with Orbisstractus. Clients can view their asset portfolio, track assessments currently underway, or launch a new assessment request with or without a public tender process.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip label="Partner Network" sx={{ bgcolor: legacyTokens.greenSoft, color: legacyTokens.green, fontWeight: 800 }} />
            <Chip label="Powered by Orbisstractus" sx={{ bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, fontWeight: 800 }} />
          </Stack>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
          {metrics.map((metric) => (
            <Box key={metric.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 2.5 }, minHeight: 118, bgcolor: '#fff' }}>
              <Typography sx={{ color: legacyTokens.navy, fontSize: 32, lineHeight: 1, fontWeight: 900, mb: 1.25 }}>{metric.value}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.35 }}>{metric.label}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      <Box component="section" aria-label="Partner Network destinations" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
        {actions.map((action) => (
          <Card key={action.number} sx={{ p: { xs: 2.75, md: 3.25 }, display: 'flex', flexDirection: 'column', minHeight: 390, transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 20px 48px rgba(11,31,58,.12)' } }}>
            <Box sx={{ width: 50, height: 50, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, fontWeight: 900, fontSize: 14, mb: 2.5 }}>{action.number}</Box>
            <Typography variant="h2" sx={{ fontSize: 24, letterSpacing: '-.02em', mb: 1.5 }}>{action.title}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.65, mb: 2.5 }}>{action.description}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 3 }}>
              {action.tags.map((tag) => <Chip key={tag.label} label={tag.label} size="small" sx={tagSx(tag.tone)} />)}
            </Stack>
            <Button component={Link} to={action.to} fullWidth endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 'auto', py: 1.35, borderRadius: 99, bgcolor: legacyTokens.blueSoft, color: legacyTokens.blue, '&:hover': { bgcolor: '#dcecff' } }}>{action.button}</Button>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
