import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import FlightIcon from '@mui/icons-material/Flight';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StatusChip, { conditionTone, type StatusTone } from './StatusChip';
import RowActionButton from './RowActionButton';
import type { Condition } from '../../domain/portfolioAssets';
import type { Observation, ObservationMediaItem, ObservationMediaType } from '../store/observationStore';
import { UNIFORMAT_CODE_BY_SYSTEM, getUniformatBreadcrumb } from '../../features/insightx/pm-intake/uniformatTree';
import { legacyTokens } from '../../theme/theme';

const CONDITIONS: Condition[] = ['good', 'fair', 'poor', 'critical'];
const METHOD_OPTIONS = ['Visual', 'Probe', 'Drone', 'Thermal / Infrared', 'Visual + Probe'];
const QUANTITY_UNIT_OPTIONS = ['m²', 'm', 'count', 'volume (m³)'];
const WEATHER_OPTIONS = ['Overcast · 12°C · Light wind', 'Clear · Sunny', 'Rain', 'Snow / Ice', 'High Wind'];
const ACCESSIBILITY_OPTIONS = ['Full access', 'Restricted — ladder required', 'Restricted — confined space', 'No access'];
const THERMAL_ANOMALY_OPTIONS = ['None detected', 'Suspected — thermal bridging at slab edge', 'Confirmed — IR scan positive'];
const MOISTURE_INDICATION_OPTIONS = ['None', 'Water staining at sill', 'Active seepage', 'Confirmed infiltration — probe test'];
const SEALANT_CONDITION_OPTIONS = [
  'Good — Intact, flexible',
  'Minor cracking',
  'Cracking and separation — repair needed',
  'Failed — full replacement required',
];
const AIR_LEAKAGE_OPTIONS = ['Suspected at joint perimeter', 'Confirmed — smoke pencil test', 'None'];

export const MEDIA_TYPE_PREFIX: Record<ObservationMediaType, string> = {
  photo: 'PHOTO',
  thermal: 'THERM',
  drone: 'DRONE',
  voice: 'VOICE',
  markup: 'MARKUP',
  video: 'VIDEO',
};

export const MEDIA_TYPE_ICON: Record<ObservationMediaType, typeof PhotoCameraIcon> = {
  photo: PhotoCameraIcon,
  thermal: ThermostatIcon,
  drone: FlightIcon,
  voice: MicIcon,
  markup: EditIcon,
  video: PlayCircleIcon,
};

export const MEDIA_TILE_COLOR: Record<ObservationMediaType, { bg: string; fg: string }> = {
  photo: { bg: legacyTokens.navy, fg: '#fff' },
  drone: { bg: legacyTokens.navy, fg: '#fff' },
  thermal: { bg: '#c2540a', fg: '#fff' },
  voice: { bg: legacyTokens.blue, fg: '#fff' },
  markup: { bg: '#b8860b', fg: '#241a02' },
  video: { bg: '#7a1f1f', fg: '#fff' },
};

const MEDIA_TYPE_PLACEHOLDER_NOTE: Record<ObservationMediaType, string> = {
  photo: 'Placeholder photo (demo only). In a real deployment this would show the captured field image.',
  thermal: 'Placeholder thermal/IR capture (demo only). In a real deployment this would show the IR scan.',
  drone: 'Placeholder drone capture (demo only). In a real deployment this would show the aerial image or video.',
  voice: 'Placeholder audio file (demo only). In a real deployment this would play a recorded field narration.',
  markup: 'Placeholder markup (demo only). In a real deployment this would show the annotated drawing.',
  video: 'Placeholder video clip (demo only). In a real deployment this would play the captured field video.',
};

type QaStatus = 'draft' | 'inReview' | 'complete';

const QA_STATUS_LABEL: Record<QaStatus, string> = { draft: 'Draft', inReview: 'In Review', complete: 'Complete' };
const QA_STATUS_TONE: Record<QaStatus, StatusTone> = { draft: 'neutral', inReview: 'warning', complete: 'success' };

interface ObservationCardProps {
  observation: Observation;
  onChange: (patch: Partial<Observation>) => void;
  onCreateDeficiency: () => void;
  onRequestReview: () => void;
  onApprove: () => void;
}

export default function ObservationCard({ observation: o, onChange, onCreateDeficiency, onRequestReview, onApprove }: ObservationCardProps) {
  const [lightboxItem, setLightboxItem] = useState<ObservationMediaItem | null>(null);
  const isEnvelope = o.systemName === 'Building Envelope';
  const code = o.uniformatCode ?? UNIFORMAT_CODE_BY_SYSTEM[o.systemName];
  const evidenceLinked = o.media.length > 0;
  const hasEnvelopeRisk =
    isEnvelope &&
    ((o.thermalAnomaly && o.thermalAnomaly !== 'None detected') ||
      (o.moistureIndication && o.moistureIndication !== 'None') ||
      (o.airLeakage && o.airLeakage !== 'None'));

  const qaStatus: QaStatus = o.reviewed ? 'complete' : o.notes.trim() || o.media.length > 0 ? 'inReview' : 'draft';

  const photoCount = o.media.filter((m) => m.type === 'photo').length;
  const voiceCount = o.media.filter((m) => m.type === 'voice').length;
  const thermalCount = o.media.filter((m) => m.type === 'thermal').length;
  const droneCount = o.media.filter((m) => m.type === 'drone').length;
  const markupCount = o.media.filter((m) => m.type === 'markup').length;

  function addMedia(type: ObservationMediaType, caption: string) {
    onChange({ media: [...o.media, { id: `MED-${Date.now()}`, type, caption }] });
  }

  function removeMedia(id: string) {
    onChange({ media: o.media.filter((m) => m.id !== id) });
    setLightboxItem((current) => (current?.id === id ? null : current));
  }

  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800 }}>{o.component}</Typography>
            <Typography variant="caption" color="text.secondary">
              {code} · {o.systemName}
            </Typography>
          </Box>
          <StatusChip label={QA_STATUS_LABEL[qaStatus]} tone={QA_STATUS_TONE[qaStatus]} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {getUniformatBreadcrumb(code)}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 1.5 }}>
          <TextField
            select
            label="Condition"
            size="small"
            value={o.condition}
            onChange={(e) => onChange({ condition: e.target.value as Condition })}
          >
            {CONDITIONS.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Inspection Method" size="small" value={o.method} onChange={(e) => onChange({ method: e.target.value })}>
            {METHOD_OPTIONS.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Quantity"
              size="small"
              type="number"
              value={o.quantity}
              onChange={(e) => onChange({ quantity: Number(e.target.value) })}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Unit"
              size="small"
              value={o.quantityUnit}
              onChange={(e) => onChange({ quantityUnit: e.target.value })}
              sx={{ minWidth: 100 }}
            >
              {QUANTITY_UNIT_OPTIONS.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField label="Location" size="small" value={o.location} onChange={(e) => onChange({ location: e.target.value })} />
          <TextField
            select
            label="Weather / Conditions"
            size="small"
            value={o.weather}
            onChange={(e) => onChange({ weather: e.target.value })}
          >
            {WEATHER_OPTIONS.map((w) => (
              <MenuItem key={w} value={w}>
                {w}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Accessibility"
            size="small"
            value={o.accessibility}
            onChange={(e) => onChange({ accessibility: e.target.value })}
          >
            {ACCESSIBILITY_OPTIONS.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {isEnvelope && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>
              Envelope-Specific Detail
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
              <TextField
                select
                label="Thermal Anomaly"
                size="small"
                value={o.thermalAnomaly ?? THERMAL_ANOMALY_OPTIONS[0]}
                onChange={(e) => onChange({ thermalAnomaly: e.target.value })}
              >
                {THERMAL_ANOMALY_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Moisture Indication"
                size="small"
                value={o.moistureIndication ?? MOISTURE_INDICATION_OPTIONS[0]}
                onChange={(e) => onChange({ moistureIndication: e.target.value })}
              >
                {MOISTURE_INDICATION_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Sealant Condition"
                size="small"
                value={o.sealantCondition ?? SEALANT_CONDITION_OPTIONS[0]}
                onChange={(e) => onChange({ sealantCondition: e.target.value })}
              >
                {SEALANT_CONDITION_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Air Leakage"
                size="small"
                value={o.airLeakage ?? AIR_LEAKAGE_OPTIONS[0]}
                onChange={(e) => onChange({ airLeakage: e.target.value })}
              >
                {AIR_LEAKAGE_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Joint Gap Width"
                size="small"
                value={o.jointGapWidth ?? ''}
                onChange={(e) => onChange({ jointGapWidth: e.target.value })}
                sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}
              />
            </Box>
          </Box>
        )}

        <TextField
          label="Field notes"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={o.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          sx={{ mb: 1.5 }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
          <StatusChip label={o.condition} tone={conditionTone(o.condition)} />
          {hasEnvelopeRisk && <StatusChip label="Envelope Risk" tone="error" />}
          <StatusChip label={evidenceLinked ? 'Evidence Linked' : 'Needs Photo QA'} tone={evidenceLinked ? 'success' : 'warning'} />
          {o.locationPinned && <StatusChip label="Location Pinned" tone="success" />}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
          <RowActionButton label="Add Photos" onClick={() => addMedia('photo', `Photo evidence — ${o.component}`)} />
          <RowActionButton label="Add Voice" onClick={() => addMedia('voice', `Voice note — ${o.component}`)} />
          <RowActionButton label="Add Video" onClick={() => addMedia('video', `Video walkthrough — ${o.component}`)} />
          <RowActionButton label="Pin Location" onClick={() => onChange({ locationPinned: true })} />
          <RowActionButton label="Add Drawing" onClick={() => addMedia('markup', `Markup annotation — ${o.component}`)} />
          <RowActionButton label="Create Deficiency" onClick={onCreateDeficiency} />
          <RowActionButton label="Request Review" onClick={onRequestReview} />
          <RowActionButton label="Approve Observation" onClick={onApprove} />
        </Stack>

        {o.media.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1, mb: 1.5 }}>
            {o.media.map((m) => {
              const Icon = MEDIA_TYPE_ICON[m.type];
              return (
                <Box
                  key={m.id}
                  sx={{
                    position: 'relative',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1,
                    pt: 1.5,
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => setLightboxItem(m)}
                >
                  <IconButton
                    size="small"
                    aria-label={`Remove ${m.caption}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMedia(m.id);
                    }}
                    sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Icon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                    {MEDIA_TYPE_PREFIX[m.type]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.caption}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, textAlign: 'center' }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
            <Typography sx={{ fontWeight: 900 }}>{photoCount}</Typography>
            <Typography variant="caption" color="text.secondary">
              Photos linked
            </Typography>
          </Box>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
            <Typography sx={{ fontWeight: 900 }}>
              {voiceCount} + {thermalCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Voice + Thermal
            </Typography>
          </Box>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
            <Typography sx={{ fontWeight: 900 }}>
              {droneCount} + {markupCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Drone + Markup
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Dialog open={Boolean(lightboxItem)} onClose={() => setLightboxItem(null)} fullWidth maxWidth="xs">
        {lightboxItem && (
          <>
            <DialogTitle>
              {MEDIA_TYPE_PREFIX[lightboxItem.type]} · {lightboxItem.caption}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  py: 5,
                  mb: 1.5,
                  bgcolor: '#fbfcfe',
                }}
              >
                {(() => {
                  const Icon = MEDIA_TYPE_ICON[lightboxItem.type];
                  return <Icon sx={{ fontSize: 48, color: 'text.secondary' }} />;
                })()}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {MEDIA_TYPE_PLACEHOLDER_NOTE[lightboxItem.type]}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={() => removeMedia(lightboxItem.id)}>
                Remove
              </Button>
              <Button onClick={() => setLightboxItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}
