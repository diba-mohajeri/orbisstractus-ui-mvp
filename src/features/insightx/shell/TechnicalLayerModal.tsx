import type { ReactNode } from 'react';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { legacyTokens } from '../../../theme/theme';

interface TechnicalLayerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  dismissStyle?: 'button' | 'icon' | 'standalone';
  heightMode?: 'viewport' | 'content';
}

/** Reusable shell for screen-specific technical-layer reference content. */
export default function TechnicalLayerModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  dismissStyle = 'button',
  heightMode = 'viewport',
}: TechnicalLayerModalProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="technical-layer-title"
      slotProps={{
        backdrop: {
          sx: {
            top: { xs: 153, md: 89 },
            bgcolor: 'rgba(44, 54, 67, 0.48)',
            backdropFilter: 'grayscale(75%)',
          },
        },
        paper: {
          sx: {
            top: { xs: 153, md: 89 },
            ...(heightMode === 'content'
              ? {
                  height: 'auto',
                  maxHeight: { xs: 'calc(100% - 177px)', md: 'calc(100% - 113px)' },
                  bottom: 'auto',
                }
              : { height: { xs: 'calc(100% - 153px)', md: 'calc(100% - 89px)' } }),
            width: { xs: '100%', md: 'calc(100% - 260px)' },
            maxWidth: 1180,
            bgcolor: '#fff',
            boxShadow: '-12px 0 36px rgba(11,31,58,.16)',
          },
        },
      }}
    >
      <Box
        component="header"
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id="technical-layer-title"
            component="h2"
            sx={{ color: legacyTokens.navy, fontSize: { xs: 21, sm: 26 }, lineHeight: 1.2, fontWeight: 900, mb: 0.75 }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
          {dismissStyle === 'standalone' && (
            <Button variant="outlined" color="inherit" onClick={onClose} sx={{ mt: 1.5, borderColor: 'divider' }}>
              Close
            </Button>
          )}
        </Box>
        {dismissStyle === 'icon' ? (
          <IconButton onClick={onClose} aria-label="Close" sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            <CloseIcon />
          </IconButton>
        ) : dismissStyle === 'button' ? (
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ flexShrink: 0, borderColor: 'divider' }}>
            Close
          </Button>
        ) : null}
      </Box>

      <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3.5, overflowY: 'auto', flex: 1 }}>
        {children}
      </Box>
    </Drawer>
  );
}
