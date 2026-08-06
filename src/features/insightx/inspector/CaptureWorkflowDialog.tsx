import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { Observation, ObservationMediaItem, ObservationMediaType } from '../../../shared/store/observationStore';
import { countQueuedMediaAssets, queueMediaAsset } from '../../../shared/utils/offlineMediaStore';

export type CaptureWorkflow = 'quick' | 'voice' | 'location' | 'drone' | 'sync';

interface CaptureWorkflowDialogProps {
  mode: CaptureWorkflow | null;
  observations: Observation[];
  onClose: () => void;
  onUpdateObservation: (id: string, patch: Partial<Observation>) => void;
}

const MODE_TITLE: Record<CaptureWorkflow, string> = {
  quick: 'Quick Capture', voice: 'Voice Note', location: 'Scan Location',
  drone: 'Upload Drone Media', sync: 'Offline Sync',
};

export default function CaptureWorkflowDialog({ mode, observations, onClose, onUpdateObservation }: CaptureWorkflowDialogProps) {
  const [observationId, setObservationId] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    if (!mode) return;
    setObservationId(observations[0]?.id ?? '');
    setMessage('');
    if (mode === 'sync') void countQueuedMediaAssets().then(setQueuedCount).catch(() => setQueuedCount(0));
  }, [mode, observations]);

  const target = observations.find((item) => item.id === observationId);

  async function addFiles(files: FileList | null, type: ObservationMediaType) {
    if (!target || !files?.length) return;
    setBusy(true);
    try {
      const created: ObservationMediaItem[] = [];
      for (const file of Array.from(files)) {
        const id = `LOCAL-${crypto.randomUUID()}`;
        await queueMediaAsset({ id, observationId: target.id, file, fileName: file.name, mimeType: file.type, createdAt: new Date().toISOString() });
        created.push({ id: `MED-${crypto.randomUUID()}`, type, caption: file.name, fileName: file.name, localAssetId: id, syncStatus: 'queued' });
      }
      onUpdateObservation(target.id, { media: [...target.media, ...created] });
      setMessage(`${created.length} file${created.length === 1 ? '' : 's'} saved locally and queued for upload.`);
    } catch {
      setMessage('The file could not be stored locally. Check browser storage permissions and try again.');
    } finally {
      setBusy(false);
    }
  }

  function captureLocation() {
    if (!target) return;
    if (!navigator.geolocation) {
      setMessage('Geolocation is unavailable in this browser. Enter the location manually.');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        onUpdateObservation(target.id, { location, locationPinned: true });
        setManualLocation(location);
        setMessage('Location pin captured and linked to the observation.');
        setBusy(false);
      },
      () => { setMessage('Location permission was denied. Enter the location manually.'); setBusy(false); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function saveManualLocation() {
    if (!target || !manualLocation.trim()) return;
    onUpdateObservation(target.id, { location: manualLocation.trim(), locationPinned: true });
    setMessage('Manual location saved and linked to the observation.');
  }

  if (!mode) return null;
  const acceptsFiles = mode === 'quick' || mode === 'voice' || mode === 'drone';
  const accept = mode === 'voice' ? 'audio/*' : mode === 'drone' ? 'image/*,video/*' : 'image/*';
  const mediaType: ObservationMediaType = mode === 'voice' ? 'voice' : mode === 'drone' ? 'drone' : 'photo';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{MODE_TITLE[mode]}</DialogTitle>
      <DialogContent>
        {mode !== 'sync' && (
          <TextField select fullWidth label="Attach to Observation" value={observationId} onChange={(e) => setObservationId(e.target.value)} sx={{ mt: 1, mb: 2 }}>
            {observations.map((item) => <MenuItem key={item.id} value={item.id}>{item.id} · {item.component}</MenuItem>)}
          </TextField>
        )}
        {observations.length === 0 && mode !== 'sync' && <Alert severity="warning">Create an observation before capturing field evidence.</Alert>}
        {acceptsFiles && target && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Files are stored securely in this browser’s offline queue until the backend upload service is configured.
            </Typography>
            <Button component="label" variant="contained" disabled={busy}>
              {mode === 'quick' ? 'Open Camera / Choose Image' : mode === 'voice' ? 'Record / Choose Audio' : 'Choose Drone Images or Video'}
              <input hidden type="file" accept={accept} multiple={mode === 'drone'} capture={mode === 'drone' ? undefined : mode === 'voice' ? 'user' : 'environment'} onChange={(e) => void addFiles(e.target.files, mediaType)} />
            </Button>
          </Box>
        )}
        {mode === 'location' && target && (
          <Stack spacing={2}>
            <Button variant="contained" onClick={captureLocation} disabled={busy}>Use Current Location</Button>
            <TextField label="Manual Location" placeholder="Building zone, room, grid reference, or coordinates" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} />
            <Button variant="outlined" onClick={saveManualLocation} disabled={!manualLocation.trim()}>Save Manual Location</Button>
          </Stack>
        )}
        {mode === 'sync' && (
          <Stack spacing={2}>
            <Alert severity="info">Backend synchronization is not configured. Captured evidence remains safely queued on this device.</Alert>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><Typography sx={{ fontWeight: 800 }}>{queuedCount} queued media file{queuedCount === 1 ? '' : 's'}</Typography><Typography variant="body2" color="text.secondary">Waiting for the production upload service.</Typography></Box>
            <Button variant="contained" disabled>Sync Now</Button>
          </Stack>
        )}
        {busy && <LinearProgress sx={{ mt: 2 }} />}
        {message && <Alert severity={message.includes('could not') || message.includes('denied') ? 'warning' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}
