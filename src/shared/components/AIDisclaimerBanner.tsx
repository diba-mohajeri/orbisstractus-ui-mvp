import { Alert, AlertTitle } from '@mui/material';

interface AIDisclaimerBannerProps {
  message?: string;
}

export default function AIDisclaimerBanner({ message }: AIDisclaimerBannerProps) {
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 900 }}>AI Decision Support Only</AlertTitle>
      {message ??
        'These insights are generated to assist review, not to replace it. All AI-derived findings, cost estimates, and recommendations require professional review before use in capital or safety decisions.'}
    </Alert>
  );
}
