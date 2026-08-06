import { type FormEvent, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { CreateAssessmentRequest } from '../../../api/contracts/operations';
import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useToast } from '../../../shared/store/toastStore';
import { legacyTokens } from '../../../theme/theme';
import { useCreateAssessment } from '../../client-portal/api';
import TechnicalLayerModal from '../shell/TechnicalLayerModal';

interface NewAssessmentModalProps {
  open: boolean;
  onClose: () => void;
}

type FormState = Omit<CreateAssessmentRequest, 'yearBuilt' | 'grossFloorAreaSqm' | 'storeys' | 'assessmentHorizonYears'> & {
  yearBuilt: string;
  grossFloorAreaSqm: string;
  storeys: string;
  assessmentHorizonYears: string;
};

const INITIAL_FORM: FormState = {
  projectOwner: '',
  clientOrganization: '',
  clientContact: '',
  purpose: 'Lender requirement — refinancing',
  portfolioName: '',
  portfolioType: '',
  assetsInPortfolio: '',
  propertyAddress: '',
  yearBuilt: '',
  grossFloorAreaSqm: '',
  storeys: '',
  occupancyType: '',
  structureType: '',
  envelopeType: '',
  assessmentType: 'Full BCA (visual)',
  pEngReviewerName: '',
  inspectorName: '',
  siteVisitDate: '',
  assessmentHorizonYears: '10',
  deliveryMethod: 'Both',
  assessmentScope: ['Full BCA (visual)'],
  requiredDeliverables: ['Excel Capital Plan', 'Word Narrative Report', 'PDF Package'],
  applicableCodes: ['Ontario Building Code (OBC)', 'CSA Standards'],
};

const STEP_COLORS = ['#2869b2', '#7652aa', '#16835f', '#bf7a16'];
const fieldGridSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 };
const fieldBoxSx = { bgcolor: '#f7f8fa', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: { xs: 2, sm: 2.5 } };

export default function NewAssessmentModal({ open, onClose }: NewAssessmentModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const createAssessment = useCreateAssessment();
  const queryClient = useQueryClient();
  const setCurrentProjectId = useInsightXShellStore((state) => state.setCurrentProjectId);
  const toast = useToast();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleList(key: 'assessmentScope' | 'requiredDeliverables' | 'applicableCodes', value: string) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.projectOwner || !form.clientOrganization || !form.propertyAddress || !form.siteVisitDate) {
      toast('Complete Project Owner, Client, Property Address, and Site Visit Date.');
      return;
    }

    const result = await createAssessment.mutateAsync({
      ...form,
      yearBuilt: Number(form.yearBuilt) || new Date().getFullYear(),
      grossFloorAreaSqm: Number(form.grossFloorAreaSqm) || 0,
      storeys: Number(form.storeys) || 0,
      assessmentHorizonYears: Number(form.assessmentHorizonYears),
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['buildings'] }),
      queryClient.invalidateQueries({ queryKey: ['portfolio-regions'] }),
    ]);
    setCurrentProjectId(result.project.id);
    setForm(INITIAL_FORM);
    onClose();
    toast(`${result.project.buildingName} assessment created and opened in Intake.`);
  }

  return (
    <TechnicalLayerModal
      open={open}
      onClose={onClose}
      dismissStyle="icon"
      title="New BCA Assessment"
      subtitle={<>Create a Project Record structured as <strong>Client → Asset Portfolio → Asset → Project</strong>. This becomes the Project Record in PM / Intake.</>}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ bgcolor: legacyTokens.navy, color: '#fff', borderRadius: 2.5, p: 2.25, mb: 3.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' }, gap: 2.5, alignItems: 'end' }}>
          <TextField
            label="PROJECT OWNER"
            required
            value={form.projectOwner}
            onChange={(event) => update('projectOwner', event.target.value)}
            placeholder="BuildSphere team member responsible for this project — e.g. S. Ahmed"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiInputLabel-root': { color: '#fff', fontWeight: 900 }, '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,.08)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.35)' }, '& input::placeholder': { color: '#dbe5ef', opacity: 1 } }}
          />
          <Typography variant="body2" sx={{ color: '#e3ebf4', pb: 1 }}>
            Internal BuildSphere owner accountable for delivery end-to-end.
          </Typography>
        </Box>

        <Step number={1} title="Client" description="Who is commissioning this assessment?">
          <Box sx={fieldGridSx}>
            <TextField required label="Client / Organization Name" placeholder="e.g. Maple Properties Inc." value={form.clientOrganization} onChange={(e) => update('clientOrganization', e.target.value)} />
            <TextField label="Client Contact" placeholder="e.g. J. Wong · j.wong@maple.ca" value={form.clientContact} onChange={(e) => update('clientContact', e.target.value)} />
            <SelectField label="Purpose / Driver" value={form.purpose} onChange={(value) => update('purpose', value)} options={['Lender requirement — refinancing', 'Pre-acquisition due diligence', 'Insurance renewal requirement', 'Routine condition assessment']} />
          </Box>
        </Step>

        <Step number={2} title="Asset Portfolio" description="Which portfolio does this asset belong to?">
          <Box sx={fieldGridSx}>
            <TextField label="Portfolio Name" placeholder="e.g. Ontario Commercial Portfolio" value={form.portfolioName} onChange={(e) => update('portfolioName', e.target.value)} />
            <SelectField label="Portfolio Type" value={form.portfolioType} onChange={(value) => update('portfolioType', value)} options={['Commercial', 'Residential', 'Mixed Use', 'Institutional', 'Industrial']} placeholder />
            <TextField label="Assets in Portfolio" placeholder="e.g. 7 properties" value={form.assetsInPortfolio} onChange={(e) => update('assetsInPortfolio', e.target.value)} />
          </Box>
        </Step>

        <Step number={3} title="Asset" description="Physical building being assessed">
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField required fullWidth label="Property Address" placeholder="e.g. 100 King St W, Toronto ON M5X 1A9" value={form.propertyAddress} onChange={(e) => update('propertyAddress', e.target.value)} />
            <Box sx={fieldGridSx}>
              <TextField label="Year Built" type="number" placeholder="e.g. 1987" value={form.yearBuilt} onChange={(e) => update('yearBuilt', e.target.value)} />
              <TextField label="Gross Floor Area (m²)" type="number" placeholder="e.g. 12400" value={form.grossFloorAreaSqm} onChange={(e) => update('grossFloorAreaSqm', e.target.value)} />
              <TextField label="Storeys" type="number" placeholder="e.g. 8" value={form.storeys} onChange={(e) => update('storeys', e.target.value)} />
            </Box>
            <Box sx={fieldGridSx}>
              <SelectField label="Occupancy Type" value={form.occupancyType} onChange={(value) => update('occupancyType', value)} options={['Commercial — Office/Retail', 'Residential — Condominium', 'Residential — Rental Apartment', 'Mixed Use — Residential/Commercial']} placeholder />
              <SelectField label="Structural System" value={form.structureType} onChange={(value) => update('structureType', value)} options={['RC frame', 'Steel frame', 'Masonry bearing wall', 'Wood frame']} placeholder />
              <SelectField label="Envelope System" value={form.envelopeType} onChange={(value) => update('envelopeType', value)} options={['Brick veneer + curtain wall', 'Precast concrete panel', 'Brick masonry', 'Metal cladding + glazing']} placeholder />
            </Box>
          </Box>
        </Step>

        <Step number={4} title="Project" description="Assessment scope, team, and deliverables">
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Box sx={fieldGridSx}>
              <SelectField label="Assessment Type" value={form.assessmentType} onChange={(value) => update('assessmentType', value)} options={['Full BCA (visual)', 'Focused BCA', 'Desktop review']} />
              <TextField label="P.Eng. Reviewer" placeholder="e.g. J. Smith, P.Eng." value={form.pEngReviewerName} onChange={(e) => update('pEngReviewerName', e.target.value)} />
              <TextField label="Inspector" placeholder="e.g. R. Patel" value={form.inspectorName} onChange={(e) => update('inspectorName', e.target.value)} />
            </Box>
            <Box sx={fieldGridSx}>
              <TextField required label="Planned Site Visit Date" type="date" value={form.siteVisitDate} onChange={(e) => update('siteVisitDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <SelectField label="Capital Planning Horizon" value={form.assessmentHorizonYears} onChange={(value) => update('assessmentHorizonYears', value)} options={[['5', '5 years'], ['10', '10 years'], ['15', '15 years'], ['20', '20 years']]} />
              <SelectField label="Client Delivery Preference" value={form.deliveryMethod} onChange={(value) => update('deliveryMethod', value as FormState['deliveryMethod'])} options={['Portal', 'Email', 'Both']} />
            </Box>
            <Box sx={fieldGridSx}>
              <CheckboxList title="Assessment Scope" selected={form.assessmentScope} onToggle={(value) => toggleList('assessmentScope', value)} items={['Full BCA (visual)', 'Building Envelope Review', 'Reserve Fund Study', 'Structural Assessment']} />
              <CheckboxList title="Required Deliverables" selected={form.requiredDeliverables} onToggle={(value) => toggleList('requiredDeliverables', value)} items={['Excel Capital Plan', 'Word Narrative Report', 'PDF Package', 'Photo Appendix (separate)']} mandatory="Excel Capital Plan" />
              <CheckboxList title="Applicable Codes & Standards" selected={form.applicableCodes} onToggle={(value) => toggleList('applicableCodes', value)} items={['Ontario Building Code (OBC)', 'CSA Standards', 'NFPA (fire / life safety)', 'ASHRAE (HVAC / energy)']} />
            </Box>
          </Box>
        </Step>

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" color="success" disabled={createAssessment.isPending}>
            {createAssessment.isPending ? 'Creating Assessment…' : 'Create Assessment & Go to Intake'}
          </Button>
          <Button type="button" onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </TechnicalLayerModal>
  );
}

function Step({ number, title, description, children }: { number: number; title: string; description: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: STEP_COLORS[number - 1], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>{number}</Box>
        <Box>
          <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 19, fontWeight: 900 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
      </Box>
      <Box sx={fieldBoxSx}>{children}</Box>
    </Box>
  );
}

function SelectField({ label, value, onChange, options, placeholder = false }: { label: string; value: string; onChange: (value: string) => void; options: (string | [string, string])[]; placeholder?: boolean }) {
  return (
    <TextField select fullWidth label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {placeholder && <MenuItem value="">— select —</MenuItem>}
      {options.map((option) => {
        const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
        return <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>;
      })}
    </TextField>
  );
}

function CheckboxList({ title, items, selected, onToggle, mandatory }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void; mandatory?: string }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 850, mb: 0.75 }}>{title}</Typography>
      <FormGroup>
        {items.map((item) => (
          <FormControlLabel
            key={item}
            control={<Checkbox size="small" checked={selected.includes(item)} onChange={() => onToggle(item)} />}
            label={<Typography variant="body2">{item} {item === mandatory && <Box component="span" sx={{ color: '#c2410c', fontSize: 11, fontWeight: 850, ml: 0.5 }}>Mandatory</Box>}</Typography>}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
