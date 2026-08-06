import { type FormEvent, useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import type { Condition, SystemName } from '../../../domain/portfolioAssets';
import { legacyTokens } from '../../../theme/theme';
import TechnicalLayerModal from '../shell/TechnicalLayerModal';

export interface NewObservationValues {
  code: string;
  systemName: SystemName;
  condition: Condition;
  method: string;
  quantity: number;
  quantityUnit: string;
  location: string;
  weather: string;
  accessibility: string;
  notes: string;
}

interface NewObservationModalProps {
  open: boolean;
  onClose: () => void;
  observationId: string;
  defaultCode: string;
  onSave: (values: NewObservationValues) => void;
}

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }, { value: 'critical', label: 'Critical' },
];
const METHODS = ['Visual', 'Probe', 'Drone', 'Thermal / Infrared', 'Visual + Probe'];
const UNITS = ['m²', 'm', 'count', 'm³'];
const WEATHER = ['Overcast · 12°C · Light wind', 'Clear · Sunny', 'Rain', 'Snow / Ice', 'High Wind'];
const ACCESS = ['Full access', 'Restricted — ladder required', 'Restricted — confined space', 'No access'];

function systemForCode(code: string): SystemName {
  if (code.startsWith('B30')) return 'Roofing';
  if (code.startsWith('B20')) return 'Building Envelope';
  if (code.startsWith('B10')) return 'Structure';
  if (code.startsWith('D20')) return 'Plumbing';
  if (code.startsWith('D30')) return 'Mechanical (HVAC)';
  if (code.startsWith('D40')) return 'Fire & Life Safety';
  if (code.startsWith('D50')) return 'Electrical';
  if (code.startsWith('C')) return 'Interior Finishes';
  return 'Site & Civil';
}

export default function NewObservationModal({ open, onClose, observationId, defaultCode, onSave }: NewObservationModalProps) {
  const [code, setCode] = useState(defaultCode);
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<Condition>('fair');
  const [method, setMethod] = useState('Visual');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('m²');
  const [weather, setWeather] = useState(WEATHER[0]);
  const [accessibility, setAccessibility] = useState('Full access');
  const [notes, setNotes] = useState('');
  const [deficiencyHint, setDeficiencyHint] = useState('None — observation only');

  useEffect(() => { if (open) setCode(defaultCode); }, [defaultCode, open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim() || !location.trim() || !notes.trim() || !method || !weather) return;
    onSave({ code: code.trim(), systemName: systemForCode(code.trim()), condition, method, quantity: Number(quantity) || 0, quantityUnit: unit, location: location.trim(), weather, accessibility, notes: notes.trim() });
    setLocation('');
    setNotes('');
    setQuantity('0');
  }

  const valid = Boolean(code.trim() && location.trim() && notes.trim() && method && weather);

  return (
    <TechnicalLayerModal open={open} onClose={onClose} dismissStyle="standalone" title={`New Observation · ${observationId}`} subtitle="Complete all required fields before saving. ASTM/BCA code and location are mandatory.">
      <Box component="form" onSubmit={submit}>
        <Box role="note" sx={{ bgcolor: legacyTokens.amberSoft, borderLeft: `4px solid ${legacyTokens.amber}`, borderRadius: 1.5, color: '#805415', px: 2, py: 1.5, mb: 2.5, fontWeight: 650 }}>
          Select an ASTM/BCA code from the System Navigator, then fill in all required fields below.
        </Box>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <FieldRow label="ASTM/BCA Code" required><TextField fullWidth size="small" value={code} onChange={(e) => setCode(e.target.value)} /></FieldRow>
          <FieldRow label="Location" required><TextField fullWidth size="small" placeholder="Building zone, floor, room, grid ref…" value={location} onChange={(e) => setLocation(e.target.value)} /></FieldRow>
          <FieldRow label="Condition Rating" required><Select value={condition} onChange={(v) => setCondition(v as Condition)} options={CONDITIONS.map((o) => [o.value, o.label])} /></FieldRow>
          <FieldRow label="Inspection Method" required><Select value={method} onChange={setMethod} options={METHODS} /></FieldRow>
          <FieldRow label="Quantity" required><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 1 }}><TextField size="small" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /><Select value={unit} onChange={setUnit} options={UNITS} /></Box></FieldRow>
          <FieldRow label="Weather / Conditions" required><Select value={weather} onChange={setWeather} options={WEATHER} /></FieldRow>
          <FieldRow label="Accessibility"><Select value={accessibility} onChange={setAccessibility} options={ACCESS} /></FieldRow>
          <FieldRow label="Observation" required><TextField fullWidth multiline minRows={4} placeholder="Describe visible condition, deficiencies, and extents…" value={notes} onChange={(e) => setNotes(e.target.value)} /></FieldRow>
          <FieldRow label="Deficiency Hint"><Select value={deficiencyHint} onChange={setDeficiencyHint} options={['None — observation only', 'Potential deficiency — Analyst review', 'Immediate safety concern']} /></FieldRow>
        </Box>

        <Box role="note" sx={{ bgcolor: legacyTokens.greenSoft, borderLeft: `4px solid ${legacyTokens.green}`, borderRadius: 1.5, color: '#185c46', px: 2, py: 1.5, my: 2.5, fontWeight: 650 }}>
          After saving, attach photos, voice notes, and a location pin before sending to Analyst. All required fields must be present for 100% completeness.
        </Box>
        <Button type="submit" variant="contained" color="success" disabled={!valid}>Save Observation</Button>
      </Box>
    </TechnicalLayerModal>
  );
}

function FieldRow({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '240px 1fr' }, borderTop: '1px solid', borderColor: 'divider', '&:first-of-type': { borderTop: 0 } }}><Box sx={{ bgcolor: '#f4f6f8', px: 2, py: 1.6 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{label}{required && <Box component="span" sx={{ color: '#c2410c', ml: 0.4 }}>*</Box>}</Typography></Box><Box sx={{ bgcolor: '#fff', p: 1.25 }}>{children}</Box></Box>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: (string | [string, string])[] }) {
  return <TextField select fullWidth size="small" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => { const [v, label] = Array.isArray(option) ? option : [option, option]; return <MenuItem key={v} value={v}>{label}</MenuItem>; })}</TextField>;
}
