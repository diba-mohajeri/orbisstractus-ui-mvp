import { createTheme } from '@mui/material/styles';

export const legacyTokens = {
  navy: '#0b1f3a',
  blue: '#1f5fab',
  blueSoft: '#edf5ff',
  green: '#0f8a5f',
  greenSoft: '#e9f8f1',
  amber: '#b7791f',
  amberSoft: '#fff6e6',
  red: '#b42318',
  redSoft: '#fff1f0',
  bg: '#f4f7fb',
  line: '#d8e1ec',
  text: '#172033',
  muted: '#667085',
  shadow: '0 16px 42px rgba(11,31,58,.08)',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: legacyTokens.blue, contrastText: '#ffffff' },
    success: { main: legacyTokens.green },
    warning: { main: legacyTokens.amber },
    error: { main: legacyTokens.red },
    background: { default: legacyTokens.bg, paper: '#ffffff' },
    divider: legacyTokens.line,
    text: { primary: legacyTokens.text, secondary: legacyTokens.muted },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
    h1: { color: legacyTokens.navy, fontWeight: 900 },
    h2: { color: legacyTokens.navy, fontWeight: 900 },
    h3: { color: legacyTokens.navy, fontWeight: 800 },
    h4: { color: legacyTokens.navy, fontWeight: 800 },
    button: { fontWeight: 800 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12, fontWeight: 800 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: `1px solid ${legacyTokens.line}`,
          boxShadow: legacyTokens.shadow,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 0 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 800, minHeight: 0 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
