import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from './api';
import { useAuthStore } from '../../shared/store/authStore';
import type { LoginAudience } from '../../domain/auth';
import orbisstractusMark from '../../assets/orbisstractus-mark.png';
import { ApiError } from '../../api/client';
import { legacyTokens } from '../../theme/theme';

const CHECKLIST = [
  {
    title: 'Orbisstractus Partner Network',
    description: 'Status, requests, reports, deliverables.',
  },
  {
    title: 'InsightX Workspace',
    description: 'Role-based execution for intake, inspection, analysis, QA, and delivery.',
  },
  {
    title: 'Orbisstractus Backbone',
    description: 'Structured data, ASTM/BCA hierarchy, traceability, and report automation.',
  },
];

const AUDIENCE_COPY: Record<
  LoginAudience,
  { heading: string; subtitle: string; emailPlaceholder: string }
> = {
  client: {
    heading: 'Orbisstractus Partner Network Login',
    subtitle: 'Access your portfolio, assessment status, requests, and deliverables.',
    emailPlaceholder: 'client@example.com',
  },
  employee: {
    heading: 'InsightX Employee Login',
    subtitle: 'Access InsightX by role: PM / Intake, Inspector, Analyst, Report + QA, and Delivery.',
    emailPlaceholder: 'employee@absi.ca',
  },
};

export default function SignInPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const signIn = useSignIn();

  const [audience, setAudience] = useState<LoginAudience>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmployee = audience === 'employee';
  const copy = AUDIENCE_COPY[audience];

  function submit(intent: 'default' | 'request-assessment') {
    signIn.mutate(
      {
        audience,
        email,
        password,
        intent,
      },
      {
        onSuccess: (data) => {
          setSession({
            token: data.token,
            user: {
              email: data.email,
              audience: data.audience,
              role: data.role,
              permissions: data.permissions,
              companyId: data.companyId,
              employeeId: data.employeeId,
            },
            expiresAt: data.expiresAt,
          });
          navigate(data.redirectTo);
        },
      },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit('default');
  }

  const errorMessage =
    signIn.isError && signIn.error instanceof ApiError
      ? signIn.error.message
      : signIn.isError
        ? 'Something went wrong. Please try again.'
        : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${legacyTokens.navy} 0%, #12345a 50%, ${legacyTokens.blueSoft} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3.5}
        sx={{ width: '100%', maxWidth: 1180, alignItems: 'stretch' }}
      >
        <Card
          sx={{
            flex: 1.15,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(255,255,255,0.18)',
            color: '#fff',
            boxShadow: legacyTokens.shadow,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Box
                component="img"
                src={orbisstractusMark}
                alt="Orbisstractus"
                sx={{ width: 34, height: 34, borderRadius: 1.25, objectFit: 'cover' }}
              />
              <Typography variant="overline" sx={{ color: '#cfe4ff', fontWeight: 900, letterSpacing: '.04em' }}>
                Orbisstractus Platform
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ color: '#fff', mt: 1, mb: 2, fontSize: { xs: 28, md: 34 } }}>
              InsightX for assessment execution.
              <br />
              Partner Network for client collaboration.
            </Typography>
            <Typography sx={{ color: '#e2edf8', lineHeight: 1.6, mb: 3 }}>
              Orbisstractus powers the platform. InsightX runs the assessment workflow from intake to
              final report. The Orbisstractus Partner Network gives clients portfolio visibility,
              project status, requests, and controlled collaboration.
            </Typography>
            <Stack spacing={2}>
              {CHECKLIST.map((item) => (
                <Stack key={item.title} direction="row" spacing={1.5}>
                  <CheckCircleIcon sx={{ color: legacyTokens.green, mt: '2px' }} fontSize="small" />
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 800 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#d6e2ef' }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 0.85 }}>
          <CardContent sx={{ p: 4 }}>
            <Tabs value={audience} onChange={(_, value: LoginAudience) => setAudience(value)} sx={{ mb: 3 }}>
              <Tab value="client" label="Client" />
              <Tab value="employee" label="InsightX Employee" />
            </Tabs>

            <Typography variant="h4" sx={{ mb: 0.5, fontSize: 24 }}>
              {copy.heading}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {copy.subtitle}
            </Typography>

            {errorMessage && (
              <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  fullWidth
                  placeholder={copy.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  color="success"
                  variant="contained"
                  size="large"
                  disabled={signIn.isPending}
                  startIcon={signIn.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {signIn.isPending ? 'Signing in…' : 'Sign In'}
                </Button>

                <Tooltip
                  title={isEmployee ? 'Available on the Client tab — switch tabs to use this shortcut.' : ''}
                  disableHoverListener={!isEmployee}
                >
                  <span>
                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      disabled={isEmployee || signIn.isPending}
                      onClick={() => submit('request-assessment')}
                    >
                      Launch Assessment Request
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
              Demo environment — any correctly formatted email with a password of at least 4
              characters will sign you in.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
